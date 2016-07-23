"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var config_1 = require("../var/config");
var router_1 = require("./router");
var error_1 = require("./error");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + "/../public"));
app.use("/", router_1["default"]());
app.use(error_1["default"]());
app.listen(config_1["default"].PORT, function () {
    console.log("Listening on port %d in %s mode.", config_1["default"].PORT, process.env.NODE_ENV);
});
//# sourceMappingURL=app.js.map