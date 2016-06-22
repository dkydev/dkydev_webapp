"use strict";
var config = (function () {
    function config() {
    }
    config.HOST = "localhost";
    config.PORT = 80;
    config.AWS_S3_KEY = "AAAAAAAA";
    config.AWS_S3_SECRET = "AAAAAAAA";
    config.DATABASE_HOST = "localhost";
    config.DATABASE_PORT = 5432;
    config.DATABASE_USERNAME = "AAAAAAAA";
    config.DATABASE_PASSWORD = "AAAAAAAA";
    config.LOG_LEVEL = "debug";
    return config;
}());
exports.__esModule = true;
exports["default"] = config;
//# sourceMappingURL=index.js.map