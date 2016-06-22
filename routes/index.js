"use strict";
function index(req, res) {
    res.render("layout.html", { title: "Stuff", template: "home.html" });
}
exports.index = index;
//# sourceMappingURL=index.js.map