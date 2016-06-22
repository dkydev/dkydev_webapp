import * as http from "http";
import * as url from "url";
import * as express from "express";
import {Request, Response} from "express";
import * as bodyParser from "body-parser";
import * as errorHandler from "errorhandler";
import * as methodOverride from "method-override";
import * as routes from "./routes";
import config from "./config";

var app = express();
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);
app.set("view options", { layout: false });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + "/public"));

// Routes.
app.get("/", routes.index);
// Catch all.
app.get('*', (req: Request, res: Response, next: any) => {
    res.status(404).render("layout.html", {
        title: "404 - dkydev",
        template: "404.html"
    });
});

// Error handling.
if (process.env.NODE_ENV !== "development") {
    app.use((err: Error, req: Request, res: Response, next: any) => {
        res.status(500).render("layout.html", {
            title: "500 - dkydev",
            template: "500.html"
        });
    });
} else {
    app.use(errorHandler());
}

app.listen(config.PORT, () => {
    console.log("Listening on port %d in %s mode.", config.PORT, process.env.NODE_ENV);
});