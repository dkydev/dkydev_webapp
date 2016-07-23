"use strict";
var config_1 = require("./config");
var pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    host: config_1["default"].DATABASE_HOST,
    port: config_1["default"].DATABASE_PORT,
    database: config_1["default"].DATABASE_NAME,
    user: config_1["default"].DATABASE_USERNAME,
    password: config_1["default"].DATABASE_PASSWORD
});
function getClient() {
    return exports.pool.connect();
}
function getPosts() {
    return getClient().then(function (client) {
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
    return getClient().then(function (client) {
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
//# sourceMappingURL=db.js.map