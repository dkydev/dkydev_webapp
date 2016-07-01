import {Request, Response} from "express";
import * as app from "../app";
import * as moment from "moment";

export function index(req: Request, res: Response): void {
    app.renderLayout("home.html", { title: "dkydev.com home" }).then((html: string) => {
        res.status(200).send(html);
    });
}

export function edit(req: Request, res: Response): void {
    app.renderLayout("edit.html", {
        title: "dkydev.com edit",
        date: moment().format("MMM D, YYYY"),
        post: {
            post_id: 1,
            post_date: moment().format("MMM D, YYYY"),
            post_labels: null,
            post_title: null,
            post_body: null,
        },
    }).then((html: string) => {
        res.status(200).send(html);
    });
}

export function error404(req: Request, res: Response): void {
    app.renderLayout("404.html", { title: "404 - dkydev" }).then((html: string) => {
        res.status(200).send(html);
    });
}