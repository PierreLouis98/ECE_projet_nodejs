"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var level_ws_1 = __importDefault(require("level-ws"));
var User = /** @class */ (function () {
    function User(n, m, p) {
        this.name = n;
        this.mail = m;
        this.password = p;
    }
    return User;
}());
exports.User = User;
var UsersHandler = /** @class */ (function () {
    function UsersHandler(dbPath) {
        this.db = leveldb_1.LevelDB.open(dbPath);
    }
    UsersHandler.prototype.save = function (user, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        stream.write({ key: user.name, value: user.name + ":" + user.mail + ":" + user.password });
        stream.end();
    };
    UsersHandler.prototype.get = function (n, callback) {
        var stream = this.db.createReadStream();
        var user;
        stream.on('error', callback)
            .on('data', function (data) {
            var _a = data.value.split(":"), name = _a[0], mail = _a[1], password = _a[2];
            if (n != data.key) {
                console.log("LevelDB error: " + data + " does not match key " + n);
            }
            else {
                user = new User(name, mail, password);
            }
        })
            .on('end', function (err) {
            callback(null, user);
        });
    };
    return UsersHandler;
}());
exports.UsersHandler = UsersHandler;
