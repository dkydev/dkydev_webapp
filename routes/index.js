"use strict";
var app = require("../app");
var db = require("../db");
var moment = require("moment");
function index(req, res) {
    db.getPosts().then(function (resultSet) {
        console.log(resultSet);
        app.renderLayout("home.html", {
            title: "dkydev.com home",
            posts: resultSet.rows.map(function (post) {
                post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
                return post;
            })
        }).then(function (html) {
            res.status(200).send(html);
        });
    });
    /*
        app.renderLayout("home.html", { title: "dkydev.com home" }).then((html: string) => {
            res.status(200).send(html);
        });
        */
}
exports.index = index;
function edit(req, res) {
    app.renderLayout("edit.html", {
        title: "dkydev.com edit",
        date: moment().format("MMM D, YYYY"),
        post: {
            post_id: 1,
            post_date: moment().format("MMM D, YYYY"),
            post_labels: null,
            post_title: null,
            post_body: null
        }
    }).then(function (html) {
        res.status(200).send(html);
    });
}
exports.edit = edit;
function list(req, res) {
    db.getPosts().then(function (resultSet) {
        console.log(resultSet);
        app.renderLayout("list.html", {
            title: "dkydev.com list",
            posts: resultSet.rows.map(function (post) {
                post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
                return post;
            })
        }).then(function (html) {
            res.status(200).send(html);
        });
    });
}
exports.list = list;
function error404(req, res) {
    app.renderLayout("404.html", { title: "404 - dkydev" }).then(function (html) {
        res.status(200).send(html);
    });
}
exports.error404 = error404;
//# sourceMappingURL=index.js.map