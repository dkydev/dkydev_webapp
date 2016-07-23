"use strict";
var errorhandler = require("errorhandler");
var defaultRoutes = require("./routes/default");
function default_1() {
    if (process.env.NODE_ENV !== "development") {
        return defaultRoutes.error500;
    }
    else {
        return errorhandler();
    }
}
exports.__esModule = true;
exports["default"] = default_1;
//# sourceMappingURL=error.js.map