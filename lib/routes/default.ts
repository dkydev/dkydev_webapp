import { Request, Response } from "express";
import * as moment from "moment";
import { getBlogPosts, getNext, Post } from "../models/post";
import * as DKYUser from "../models/user";
import sendHTML from "../renderer";
import * as DKYSession from "../session";
import * as validator from "validator";

export function index(req: Request, res: Response): Promise<any> {
    // Limit page input to 1-999.
    var page: number = isNaN(req.params.p) ? 1 : Math.min(999, Math.max(1, req.params.p));
    var label: string = req.params.label ? req.params.label : "gamedev";
    return Promise.all([
        getBlogPosts(label, page),
        getNext(label, page)
    ]).then((results: any[]) => {
        return sendHTML(req, res, {
            template: "home.html",
            title: "dkydev.com home",
            posts: results[0],
            hasNext: results[1] > page,
            page : results[1],
            label : req.params.label
        });
    });
};

export function getLogout(req: Request, res: Response): Promise<any> {
    return sendHTML(req, res, {
        template: "logout.html",
        title: "logout - dkydev",
    });
}

export function logout(req: Request, res: Response): Promise<any> {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error: any) => {
            if (error) {
                reject(error);
            } else {
                DKYSession.raiseMessage(req.session, "success", "Logged out successfully.");
                res.redirect("/");
                resolve();
            }
        });
    });
}

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