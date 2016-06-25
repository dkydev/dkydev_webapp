"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var methodOverride = require("method-override");
var routes = require("./routes");
var config_1 = require("./config");
var app = express();
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);
app.set("view options", { layout: false });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + "/public"));
// Routes.
app.get("/", routes.index);
app.get("/edit", routes.edit);
// Catch all.
app.get('*', routes.error404);
// Error handling.
if (process.env.NODE_ENV !== "development") {
    app.use(function (err, req, res, next) {
        res.status(500).render("layout.html", {
            title: "500 - dkydev",
            template: "500.html"
        });
    });
}
else {
    app.use(errorHandler());
}
app.listen(config_1["default"].PORT, function () {
    console.log("Listening on port %d in %s mode.", config_1["default"].PORT, process.env.NODE_ENV);
});
//# sourceMappingURL=app.js.map