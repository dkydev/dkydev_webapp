import {Request, Response} from "express";
import * as app from "../app";
import * as db from "../db";
import {Post} from "../db";
import * as moment from "moment";
import * as errorHandler from "errorhandler";

export function index(req: Request, res: Response): Promise<any> {
    return db.getPosts().then((posts: Array<db.Post>) => {
        app.renderLayout("home.html", {
            title: "dkydev.com home",
            posts: posts.map((post: Post) => {
                post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
                return post;
            })
        }).then((html: string) => {
            res.status(200).send(html);
        });
    });
}

export function post(req: Request, res: Response): Promise<any> {
    switch (req.params.action) {
        case "edit":
            return edit(req, res);
        default:
            return list(req, res);
    }
}

function edit(req: Request, res: Response): Promise<any> {
    if (!req.params.id) {
        throw new Error("Post ID not specified.");
    }
    return db.getPost(req.params.id).then((post: Post) => {
        if (typeof post === "undefined") {
            throw new Error("Post not found.");
        }
        //date: moment().format("MMM D, YYYY"),
        console.log(post);
        post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
        return app.renderLayout("edit.html", {
            title: "dkydev.com edit",
            post: post,
            enabled : post.post_status == "enabled"
        });
    }).then((html: string) => {
        res.status(200).send(html);
    });
}

function list(req: Request, res: Response): Promise<any> {
    return db.getPosts().then((posts: Array<Post>) => {
        return app.renderLayout("list.html", {
            title: "dkydev.com list",
            posts: posts.map((post) => {
                post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
                return post;
            })
        })
    }).then((html: string) => {
        res.status(200).send(html);
    });
}

export function error404(req: Request, res: Response): Promise<any> {
    return app.renderLayout("404.html", { title: "404 - dkydev" }).then((html: string) => {
        res.status(200).send(html);
    });
}