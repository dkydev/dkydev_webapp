import {Request, Response} from "express";
import * as moment from "moment";
import sendHTML from "../renderer";
import * as modelPost from "../models/post";
import {Post} from "../models/post";
import * as DKYSession from "../session";

export function post(req: Request, res: Response): Promise<any> {
    switch (req.params.action) {
        case "view":
            return view(req, res);
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

async function save(req: Request, res: Response): Promise<void> {
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

    // Insert post.
    await modelPost.savePost(post);

    DKYSession.raiseMessage(req.session, "success", "Post saved successfully.");
    // Redirect back to list.
    res.redirect("/post");
}

async function remove(req: Request, res: Response): Promise<void> {
    if (!req.params.id) {
        DKYSession.raiseMessage(req.session, "danger", "Post not found.");
        // Redirect back to list.
        res.redirect("/post");
        return;
    }

    // Remove post.
    await modelPost.removePost(req.params.id);

    DKYSession.raiseMessage(req.session, "success", "Post deleted successfully.");
    // Redirect back to list.
    res.redirect("/post");
}

async function edit(req: Request, res: Response): Promise<void> {
    if (!req.params.id) {
        // Create a new post.
        await sendHTML(req, res, {
            template: "edit.html",
            title: "dkydev.com add",
            page_title: "New Post",
            post: {post_date: moment().format("MMM DD, YYYY")},
            enabled: true
        });
    } else {
        // Edit an existing post.
        var post: Post = await modelPost.getPost(req.params.id);

        if (typeof post === "undefined") {
            DKYSession.raiseMessage(req.session, "danger", "Post not found.");
            res.redirect("/post");
        }
        await sendHTML(req, res, {
            template: "edit.html",
            title: "dkydev.com edit",
            page_title: "Edit Post",
            post: post,
            enabled: post.post_status == "Enabled"
        });
    }
}

async function list(req: Request, res: Response): Promise<void> {
    var posts: Array<Post> = await modelPost.getAllPosts();
    await sendHTML(req, res, {
        template: "list.html",
        title: "dkydev.com list",
        posts: posts.map((post) => {
            return post;
        })
    });
}

export async function view(req: Request, res: Response): Promise<void> {
    var post: Post = null;

    try {
        if (req.params.id) {
            post = await modelPost.getPost(req.params.id);
        }
        if (req.params.alias) {
            post = await modelPost.getPostByAlias(req.params.alias);
        }
    } catch (error) {
        DKYSession.raiseMessage(req.session, "danger", "Post not found.");
        res.redirect("/");
        return;
    }

    await sendHTML(req, res, {
        template: "view.html",
        title: `dkydev.com - ${post.post_title}`,
        post: post
    });
}