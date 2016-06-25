"use strict";
function index(req, res) {
    res.render("layout.html", { title: "dkydev.com home", template: "home.html" });
}
exports.index = index;
function edit(req, res) {
    res.render("layout.html", { title: "dkydev.com edit", template: "edit.html" });
}
exports.edit = edit;
function error404(req, res) {
    res.status(404).render("layout.html", {
        title: "404 - dkydev",
        template: "404.html"
    });
}
exports.error404 = error404;
//# sourceMappingURL=index.js.map