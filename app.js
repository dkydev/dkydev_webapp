////// <reference path="typings/index.d.ts" />
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.set("views", __dirname + "/views");
app.engine('html', require('ejs').renderFile);
app.set('view options', { layout: false });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/www'));
app.get('/', function (req, res) {
    res.render("layout.html", {
        "title": "dkydev.com",
        "template": "home.html"
    });
});
app.listen(8080, function () {
    console.log("Webapp listening on port %d.", 8080);
});
exports.App = app;
//# sourceMappingURL=app.js.map