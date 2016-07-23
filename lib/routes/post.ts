import {Request, Response} from "express";
import * as moment from "moment";
import * as renderer from "../renderer";
import * as modelPost from "../models/post";

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
    return modelPost.getPost(req.params.id).then((post: modelPost.Post) => {
        if (typeof post === "undefined") {
            throw new Error("Post not found.");
        }
        //date: moment().format("MMM D, YYYY"),
        post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
        return renderer.renderLayout("edit.html", {
            title: "dkydev.com edit",
            post: post,
            enabled: post.post_status == "enabled"
        });
    }).then((html: string) => {
        res.status(200).send(html);
    });
}

function list(req: Request, res: Response): Promise<any> {
    return modelPost.getPosts().then((posts: Array<modelPost.Post>) => {
        return renderer.renderLayout("list.html", {
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