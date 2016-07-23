"use strict";
var express_1 = require("express");
var defaultRoutes = require("./routes/default");
var postRoutes = require("./routes/post");
function default_1() {
    var router = express_1.Router();
    // Routes.
    router.get("/", function (req, res, next) {
        defaultRoutes.index(req, res).catch(next);
    });
    router.get("/post/:action?/:id?", function (req, res, next) {
        postRoutes.post(req, res).catch(next);
    });
    // Catch all.
    router.get("*", function (req, res, next) {
        defaultRoutes.error404(req, res).catch(next);
    });
    return router;
}
exports.__esModule = true;
exports["default"] = default_1;
//# sourceMappingURL=router.js.map