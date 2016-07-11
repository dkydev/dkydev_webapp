"use strict";
var config_1 = require("./config");
var pg = require("pg");
//var pg: any = require('pg');
exports.pool = new pg.Pool({
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
        var res = client.query("SELECT * FROM post WHERE post_status = 'enabled' ORDER BY post_date DESC");
        client.release();
        return res;
    }).catch(function (error) {
        console.error(error);
    });
}
exports.getPosts = getPosts;
//# sourceMappingURL=db.js.map