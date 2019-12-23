"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var metrics_1 = require("./metrics");
var users_1 = require("./users");
var path = require("path");
var bodyparser = require("body-parser");
var app = express();
var port = process.env.PORT || '8080';
app.use(express.static(path.join(__dirname, '/../public')));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
app.set('views', __dirname + "/../views");
app.set('view engine', 'ejs');
var dbMet = new metrics_1.MetricsHandler('./db/metrics');
var dbUs = new users_1.UsersHandler('./db/users');
app.get('/connexion', function (req, res) {
    res.render('connexion.ejs');
    res.end();
});
app.get('/inscription', function (req, res) {
    res.render('inscription.ejs');
    res.end();
});
app.get('/hello/:name', function (req, res) {
    res.render('hello.ejs', { name: req.params.name });
});
app.get('/metrics/:id', function (req, res) {
    dbMet.get(req.params.id, function (err, result) {
        if (err)
            throw err;
        res.json(result);
    });
});
app.get('/users/:id', function (req, res) {
    dbUs.get(req.params.id, function (err, result) {
        if (err)
            throw err;
        res.json(result);
    });
});
app.post('/metrics/:id', function (req, res) {
    dbMet.save(req.params.id, req.body, function (err) {
        if (err)
            throw err;
        res.status(200).send();
    });
});
app.post('/register', function (req, res) {
    var user = new users_1.User(req.body.name, req.body.mail, req.body.pwd);
    dbUs.save(user, function (err) {
        if (err)
            throw err;
        res.status(200).send();
    });
});
app.listen(port, function (err) {
    if (err)
        throw err;
    console.log("Server is running on http://localhost:" + port);
});
