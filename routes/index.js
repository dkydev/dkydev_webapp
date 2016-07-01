"use strict";
var app = require("../app");
var moment = require("moment");
function index(req, res) {
    app.renderLayout("home.html", { title: "dkydev.com home" }).then(function (html) {
        res.status(200).send(html);
    });
}
exports.index = index;
function edit(req, res) {
    app.renderLayout("edit.html", {
        title: "dkydev.com edit",
        date: moment().format("MMM D, YYYY"),
        post: {
            post_id: 1,
            post_date: null,
            post_labels: null,
            post_title: null,
            post_body: null
        }
    }).then(function (html) {
        res.status(200).send(html);
    });
}
exports.edit = edit;
function error404(req, res) {
    app.renderLayout("404.html", { title: "404 - dkydev" }).then(function (html) {
        res.status(200).send(html);
    });
}
exports.error404 = error404;
//# sourceMappingURL=index.js.map