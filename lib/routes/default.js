"use strict";
var moment = require("moment");
var post = require("../models/post");
var renderer = require("../renderer");
function index(req, res) {
    return post.getPosts().then(function (posts) {
        renderer.renderLayout("home.html", {
            title: "dkydev.com home",
            posts: posts.map(function (post) {
                post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
                return post;
            })
        }).then(function (html) {
            res.status(200).send(html);
        });
    });
}
exports.index = index;
;
function error404(req, res) {
    return renderer.renderLayout("404.html", { title: "404 - dkydev" }).then(function (html) {
        res.status(200).send(html);
    });
}
exports.error404 = error404;
function error500(err, req, res, next) {
    return renderer.renderLayout("500.html", { title: "500 - dkydev" }).then(function (html) {
        res.status(500).send(html);
    });
}
exports.error500 = error500;
//# sourceMappingURL=default.js.map