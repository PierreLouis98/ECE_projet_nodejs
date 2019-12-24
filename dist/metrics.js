"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var level_ws_1 = __importDefault(require("level-ws"));
var Metric = /** @class */ (function () {
    function Metric(ts, v) {
        this.timestamp = ts;
        this.value = v;
    }
    return Metric;
}());
exports.Metric = Metric;
var MetricsHandler = /** @class */ (function () {
    function MetricsHandler(dbPath) {
        this.db = leveldb_1.LevelDB.open(dbPath);
    }
    MetricsHandler.prototype.save = function (key, metrics, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        metrics.forEach(function (m) {
            stream.write({ key: "metric:" + key + ":" + m.timestamp, value: m.value });
        });
        stream.end();
    };
    /*public add(name: string, key: string, value: number, callback: (error: Error | null, result?: Metric) => void) { // ajouter les métrics d'un id
      const stream = this.db.createReadStream()
      var met: Metric[] = []
    
      stream.on('error', callback)
        .on('data', (data: any) => {
          const [_, k, timestamp] = data.key.split(":")
          const value = data.value
          if (name != k) {
            console.log(`LevelDB error: ${k} does not match key ${name}`)
          } else {
            met.push(new Metric(timestamp, value))
          }
        })
        .on('end', (err: Error) => {
          console.log(key);
          const [m, k2, timestamp2] = key.split(":");
          var metric = new Metric(timestamp2, value);
          met.push(metric);
          console.log("Par Ici")
          callback(null, metric);
          console.log("La")
        })
        .on("close", () => {
          console.log("Stream ended");
        });
        this.save(name, met, (err: Error | null) => {
          if (err) throw err
          console.log('Data updated')
        })
    }*/
    MetricsHandler.prototype.get = function (key, callback) {
        var stream = this.db.createReadStream();
        var met = [];
        stream.on('error', callback)
            .on('data', function (data) {
            var _a = data.key.split(":"), m = _a[0], k = _a[1], timestamp = _a[2];
            var value = data.value;
            if (key != k) {
                console.log("LevelDB error: " + k + " does not match key " + key);
            }
            else {
                met.push(new Metric(timestamp, value));
            }
        })
            .on('end', function (err) {
            callback(null, met);
        })
            .on("close", function () {
            console.log("Stream ended");
        });
    };
    MetricsHandler.prototype.del = function (key, callback) {
        var stream = this.db.createReadStream();
        var met;
        stream.on('error', callback)
            .on('data', function (data) {
            var _a = data.key.split(":"), _ = _a[0], k = _a[1], timestamp = _a[2];
            var value = data.value;
            if (key != data.key) { // atention, gérer les erreurs (entrées incorrectes)
                console.log("LevelDB error: " + data.key + " does not match key " + key);
            }
            else {
                met = new Metric(timestamp, value);
            }
        })
            .on('end', function (err) {
            callback(null, met);
        })
            .on("close", function () {
            console.log("Stream ended");
        });
        this.db.del(key); // attention: key doit être comme dans la base de donnée (metric:Pierre-Louis:1572876000000)
    };
    return MetricsHandler;
}());
exports.MetricsHandler = MetricsHandler;
