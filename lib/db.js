"use strict";
var config_1 = require("../var/config");
var pg_1 = require("pg");
exports.Client = pg_1.Client;
var pool = new pg_1.Pool({
    host: config_1["default"].DATABASE_HOST,
    port: config_1["default"].DATABASE_PORT,
    database: config_1["default"].DATABASE_NAME,
    user: config_1["default"].DATABASE_USERNAME,
    password: config_1["default"].DATABASE_PASSWORD
});
function getClient() {
    return pool.connect().then(function (client) {
        return new Promise(function (resolve, reject) {
            resolve(client);
            client.release();
        });
    });
}
exports.getClient = getClient;
//# sourceMappingURL=db.js.map