"use strict";
var moment = require("moment");
var renderer = require("../renderer");
var modelPost = require("../models/post");
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
    return modelPost.getPost(req.params.id).then(function (post) {
        if (typeof post === "undefined") {
            throw new Error("Post not found.");
        }
        //date: moment().format("MMM D, YYYY"),
        post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
        return renderer.renderLayout("edit.html", {
            title: "dkydev.com edit",
            post: post,
            enabled: post.post_status == "enabled"
        });
    }).then(function (html) {
        res.status(200).send(html);
    });
}
function list(req, res) {
    return modelPost.getPosts().then(function (posts) {
        return renderer.renderLayout("list.html", {
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
//# sourceMappingURL=post.js.map