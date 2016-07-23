import * as fs from "fs";
import * as mustache from "mustache";

export function renderLayout(template: string, data: any): Promise<string> {
    var bodyString: string;
    var layoutString: string;
    return getTemplate(template).then((templateString) => {
        bodyString = templateString;
        return getTemplate("layout.html");
    }).then((templateString: string) => {
        layoutString = templateString;
        return new Promise((resolve: (value: string) => Promise<string>, reject: (message: string) => void) => {
            var renderedHtml: string;
            try {
                renderedHtml = mustache.render(layoutString, data, { body: bodyString })
            } catch (error) {
                console.error(error);
                reject(error);
            }
            resolve(renderedHtml);
        });
    });
}

function getTemplate(template: string): Promise<string> {
    return new Promise<string>((resolve: (templateString: string) => Promise<string>, reject: (message: string) => void) => {
        fs.readFile(`${__dirname}/views/${template}`, "utf8", (error: NodeJS.ErrnoException, data: string) => {
            if (error) {
                reject(error.message);
                console.error(error);
            }
            resolve(data);
        })
    });
}