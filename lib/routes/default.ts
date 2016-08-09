import {Request, Response} from "express";
import * as moment from "moment";
import {getBlogPosts, Post} from "../models/post";
import * as DKYUser from "../models/user";
import sendHTML from "../renderer";
import * as DKYSession from "../session";

export function index(req: Request, res: Response): Promise<any> {
    return getBlogPosts().then((posts: Array<Post>) => {
        return sendHTML(req, res, {
            template: "home.html",
            title: "dkydev.com home",
            posts: posts
        });
    });
};

export function getLogin(req: Request, res: Response): Promise<any> {
    return sendHTML(req, res, {
        template: "login.html",
        title: "login - dkydev",
        email: req.body.email ? req.body.email : null
    });
}

export function login(req: Request, res: Response): Promise<any> {
    if (!req.body.email || !req.body.password) {
        DKYSession.raiseMessage(req.session, "danger", "Form invalid.");
        return getLogin(req, res);
    } else {
        return DKYUser.login(req.body.email, req.body.password).then((user: DKYUser.User) => {
            return new Promise((resolve, reject) => {
                DKYSession.raiseMessage(req.session, "success", `Authentication successful. Welcome ${user.email}.`);
                req.session["user_id"] = user.user_id;
                res.redirect("/");
                resolve();
            });
        }).catch((error: Error) => {
            DKYSession.raiseMessage(req.session, "danger", "Authentication failed.");
            return getLogin(req, res);
        });
    }
}

export function error404(req: Request, res: Response): Promise<any> {
    return sendHTML(req, res, {
        template: "404.html",
        title: "404 - dkydev"
    });
}

export function error500(err: Error, req: Request, res: Response): Promise<any> {
    console.error(err);
    return sendHTML(req, res, {
        status: 500,
        template: "500.html",
        title: "500 - dkydev"
    });
}