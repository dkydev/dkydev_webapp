import {Request, Response} from "express";
import * as moment from "moment";
import * as renderer from "../renderer";
import * as modelPost from "../models/post";
import {Post} from "../models/post";

export function post(req: Request, res: Response): Promise<any> {
    switch (req.params.action) {
        case "edit":
            return edit(req, res);
        case "save":
            return save(req, res);
        case "remove":
            return remove(req, res);
        default:
            return list(req, res);
    }
}

function save(req: Request, res: Response): Promise<any> {
    // Validate.
    if (!Post.isValid(req.body)) {
        if (req.body.post_id) {
            req.params.post_id = req.body.post_id;
        }
        return edit(req, res);
    }
    // Split labels.
    req.body.post_labels = req.body.post_labels ? req.body.post_labels.split(",") : [];
    var post: Post = new Post(req.body);
    // Insert
    return modelPost.savePost(post).then(() => {
        // Redirect back to list.
        res.redirect("/post");
    });
}

function remove(req: Request, res: Response): Promise<any> {
    if (!req.params.id) {
        // Redirect back to list.
        res.redirect("/post");
        return;
    }
    return modelPost.removePost(req.params.id).then(() => {
        // Redirect back to list.
        res.redirect("/post");
    });
}

function edit(req: Request, res: Response): Promise<any> {
    if (!req.params.id) {
        return renderer.renderLayout("edit.html", {
            title: "dkydev.com edit",
            post: { post_date: moment().format("MMM DD, YYYY") },
            enabled: true
        }).then((html: string) => {
            res.status(200).send(html);
        });
    } else {
        return modelPost.getPost(req.params.id).then((post: Post) => {
            if (typeof post === "undefined") {
                throw new Error("Post not found.");
            }
            return renderer.renderLayout("edit.html", {
                title: "dkydev.com edit",
                post: post,
                enabled: post.post_status == "Enabled"
            });
        }).then((html: string) => {
            res.status(200).send(html);
        });
    }
}

function list(req: Request, res: Response): Promise<any> {
    return modelPost.getAllPosts().then((posts: Array<Post>) => {
        return renderer.renderLayout("list.html", {
            title: "dkydev.com list",
            posts: posts.map((post) => {
                return post;
            })
        })
    }).then((html: string) => {
        res.status(200).send(html);
    });
}