"use strict";
var DB = require("../db");
function getPosts() {
    return DB.getClient().then(function (client) {
        return new Promise(function (resolve, reject) {
            resolve(client.query("SELECT * FROM post WHERE post_status = 'enabled' ORDER BY post_date DESC"));
        });
    }).then(function (resultSet) {
        return new Promise(function (resolve, reject) {
            resolve(resultSet.rows);
        });
    });
}
exports.getPosts = getPosts;
function getPost(post_id) {
    return DB.getClient().then(function (client) {
        return new Promise(function (resolve, reject) {
            resolve(client.query("SELECT * FROM post WHERE post_id = $1", [post_id]));
        });
    }).then(function (resultSet) {
        return new Promise(function (resolve, reject) {
            resolve(resultSet.rows.pop());
        });
    });
}
exports.getPost = getPost;
//# sourceMappingURL=post.js.map