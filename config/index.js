"use strict";
var config = (function () {
    function config() {
    }
    config.HOST = "localhost";
    config.PORT = 80;
    config.DATABASE_HOST = "localhost";
    config.DATABASE_PORT = 5432;
    config.DATABASE_NAME = "dkydev_com";
    config.DATABASE_USERNAME = "postgres";
    config.DATABASE_PASSWORD = "asdfasdf";
    config.LOG_LEVEL = "debug";
    config.AWS_S3_KEY = "AAAAAAAA";
    config.AWS_S3_SECRET = "AAAAAAAA";
    return config;
}());
exports.__esModule = true;
exports["default"] = config;
//# sourceMappingURL=index.js.map