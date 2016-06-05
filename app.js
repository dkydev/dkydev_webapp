////// <reference path="typings/index.d.ts" />
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var port = 80;
app.set("views", __dirname + "/views");
app.engine('html', require('ejs').renderFile);
app.set('view options', { layout: false });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/www'));
app.get('/', function (req, res) {
    res.render("layout.html", {
        "title": "dkydev",
        "template": "home.html"
    });
});
app.use(function (req, res, next) {
    res.status(404).render("layout.html", {
        "title": "404 - dkydev",
        "template": "404.html"
    });
});
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render("layout.html", {
        "title": "500 - dkydev",
        "template": "500.html"
    });
});
app.listen(port, function () {
    console.log("Webapp listening on port %d.", port);
});
exports.App = app;
//# sourceMappingURL=app.js.map