"use strict";
var app = require("../app");
var db = require("../db");
var moment = require("moment");
function index(req, res) {
    return db.getPosts().then(function (posts) {
        app.renderLayout("home.html", {
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
function post(req, res) {
    switch (req.params.action) {
        case "edit":
            return edit(req, res);
        default:
            return list(req, res);
    }
}
exports.post = post;
function edit(req, res) {
    if (!req.params.id) {
        throw new Error("Post ID not specified.");
    }
    return db.getPost(req.params.id).then(function (post) {
        if (typeof post === "undefined") {
            throw new Error("Post not found.");
        }
        //date: moment().format("MMM D, YYYY"),
        console.log(post);
        post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
        return app.renderLayout("edit.html", {
            title: "dkydev.com edit",
            post: post,
            enabled: post.post_status == "enabled"
        });
    }).then(function (html) {
        res.status(200).send(html);
    });
}
function list(req, res) {
    return db.getPosts().then(function (posts) {
        return app.renderLayout("list.html", {
            title: "dkydev.com list",
            posts: posts.map(function (post) {
                post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
                return post;
            })
        });
    }).then(function (html) {
        res.status(200).send(html);
    });
}
function error404(req, res) {
    return app.renderLayout("404.html", { title: "404 - dkydev" }).then(function (html) {
        res.status(200).send(html);
    });
}
exports.error404 = error404;
//# sourceMappingURL=index.js.map