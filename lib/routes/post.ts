import {Request, Response} from "express";
import * as moment from "moment";
import sendHTML from "../renderer";
import * as modelPost from "../models/post";
import {Post} from "../models/post";
import * as DKYSession from "../session";

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
            req.params.id = req.body.post_id;
        }
        DKYSession.raiseMessage(req.session, "danger", "Post data is not valid.");
        return edit(req, res);
    }
    // Split labels.
    req.body.post_labels = req.body.post_labels ? req.body.post_labels.split(",") : [];
    var post: Post = new Post(req.body);
    // Insert
    return modelPost.savePost(post).then(() => {
        DKYSession.raiseMessage(req.session, "success", "Post saved successfully.");
        // Redirect back to list.
        res.redirect("/post");
    });
}

function remove(req: Request, res: Response): Promise<any> {
    if (!req.params.id) {
        DKYSession.raiseMessage(req.session, "danger", "Post not found.");
        // Redirect back to list.
        res.redirect("/post");
        return;
    }
    return modelPost.removePost(req.params.id).then(() => {
        DKYSession.raiseMessage(req.session, "success", "Post deleted successfully.");
        // Redirect back to list.
        res.redirect("/post");
    });
}

function edit(req: Request, res: Response): Promise<any> {
    if (!req.params.id) {
        // Create a new post.
        return sendHTML(req, res, {
            template: "edit.html",
            title: "dkydev.com add",
            post: { post_date: moment().format("MMM DD, YYYY") },
            enabled: true
        });
    } else {
        // Edit an existing post.
        return modelPost.getPost(req.params.id).then((post: Post) => {
            if (typeof post === "undefined") {
                DKYSession.raiseMessage(req.session, "danger", "Post not found.");
                res.redirect("/post");
            }
            return sendHTML(req, res, {
                template: "edit.html",
                title: "dkydev.com edit",
                post: post,
                enabled: post.post_status == "Enabled"
            });
        });
    }
}

function list(req: Request, res: Response): Promise<any> {
    return modelPost.getAllPosts().then((posts: Array<Post>) => {
        return sendHTML(req, res, {
            template: "list.html",
            title: "dkydev.com list",
            posts: posts.map((post) => {
                return post;
            })
        });
    });
}