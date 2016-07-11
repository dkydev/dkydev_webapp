import * as express from "express";
import * as fs from "fs";
import {Request, Response} from "express";
import * as bodyParser from "body-parser";
import * as errorHandler from "errorhandler";
import * as methodOverride from "method-override";
import * as consolidate from "consolidate";
import * as mustache from "mustache";
import * as routes from "./routes";
import config from "./config";
import * as db from "./db";

var app = express();
//app.engine("html", consolidate.mustache);
//app.set("view engine", "html");
//app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + "/public"));

// Routes.
app.get("/", routes.index);
app.get("/edit", routes.edit);
app.get("/list", routes.list);
// Catch all.
app.get('*', routes.error404);

// Error handling.
if (process.env.NODE_ENV !== "development") {
    app.use((err: Error, req: Request, res: Response, next: any) => {
        renderLayout("500.html", { title: "500 - dkydev" }).then((html: string) => {
            res.status(500).send(html);
        });
    });
} else {
    app.use(errorHandler());
}

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

app.listen(config.PORT, () => {
    console.log("Listening on port %d in %s mode.", config.PORT, process.env.NODE_ENV);
});

module.exports = this;