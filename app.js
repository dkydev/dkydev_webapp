"use strict";
var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var methodOverride = require("method-override");
var mustache = require("mustache");
var routes = require("./routes");
var config_1 = require("./config");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + "/public"));
// Routes.
app.get("/", function (req, res, next) {
    routes.index(req, res).catch(next);
});
app.get("/post/:action?/:id?", function (req, res, next) {
    routes.post(req, res).catch(next);
});
// Catch all.
app.get('*', function (req, res, next) {
    routes.error404(req, res).catch(next);
});
// Error handling.
if (process.env.NODE_ENV !== "development") {
    app.use(function (err, req, res, next) {
        renderLayout("500.html", { title: "500 - dkydev" }).then(function (html) {
            res.status(500).send(html);
        });
    });
}
else {
    app.use(errorHandler());
}
function renderLayout(template, data) {
    var bodyString;
    var layoutString;
    return getTemplate(template).then(function (templateString) {
        bodyString = templateString;
        return getTemplate("layout.html");
    }).then(function (templateString) {
        layoutString = templateString;
        return new Promise(function (resolve, reject) {
            var renderedHtml;
            try {
                renderedHtml = mustache.render(layoutString, data, { body: bodyString });
            }
            catch (error) {
                console.error(error);
                reject(error);
            }
            resolve(renderedHtml);
        });
    });
}
exports.renderLayout = renderLayout;
function getTemplate(template) {
    return new Promise(function (resolve, reject) {
        fs.readFile(__dirname + "/views/" + template, "utf8", function (error, data) {
            if (error) {
                reject(error.message);
                console.error(error);
            }
            resolve(data);
        });
    });
}
app.listen(config_1["default"].PORT, function () {
    console.log("Listening on port %d in %s mode.", config_1["default"].PORT, process.env.NODE_ENV);
});
module.exports = this;
//# sourceMappingURL=app.js.map