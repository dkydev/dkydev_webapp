"use strict";
var fs = require("fs");
var mustache = require("mustache");
function renderLayout(template, data) {
    var bodyString;
    var layoutString;
    return getTemplate(template).then(function (templateString) {
        bodyString = templateString;
        return getTemplate("layout.html");
    }).then(function (templateString) {
        layoutString = templateString;
        return new Promise(function (resolve, reject) {
            var renderedHtml;
            try {
                renderedHtml = mustache.render(layoutString, data, { body: bodyString });
            }
            catch (error) {
                console.error(error);
                reject(error);
            }
            resolve(renderedHtml);
        });
    });
}
exports.renderLayout = renderLayout;
function getTemplate(template) {
    return new Promise(function (resolve, reject) {
        fs.readFile(__dirname + "/views/" + template, "utf8", function (error, data) {
            if (error) {
                reject(error.message);
                console.error(error);
            }
            resolve(data);
        });
    });
}
//# sourceMappingURL=renderer.js.map