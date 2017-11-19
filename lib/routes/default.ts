import {Request, Response} from "express";
import * as moment from "moment";
import {getBlogPosts, getNext, Post} from "../models/post";
import * as DKYUser from "../models/user";
import sendHTML from "../renderer";
import * as DKYSession from "../session";
import * as validator from "validator";

export async function index(req: Request, res: Response): Promise<void> {
    // Limit page input to 1-999.
    var page: number = isNaN(req.params.p) ? 1 : Math.min(999, Math.max(1, req.params.p));
    var label: string = req.params.label;

    var results = await Promise.all([
        getBlogPosts(label, page),
        getNext(label, page)
    ]);

    await sendHTML(req, res, {
        template: "home.html",
        title: "dkydev - Code | Art | Games",
        posts: results[0],
        hasNext: results[1] > page,
        page: results[1],
        label: req.params.label
    });
};

export async function getLogout(req: Request, res: Response): Promise<void> {
    await sendHTML(req, res, {
        template: "logout.html",
        title: "Logout",
    });
}

export async function logout(req: Request, res: Response): Promise<void> {
    await new Promise<void>((resolve, reject) => {
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

export async function getLogin(req: Request, res: Response): Promise<void> {
    await sendHTML(req, res, {
        template: "login.html",
        title: "Login",
        email: req.body.email ? req.body.email : null
    });
}

export async function login(req: Request, res: Response): Promise<void> {
    // Validate login.
    if (!req.body.email || !req.body.password) {
        DKYSession.raiseMessage(req.session, "danger", "Form invalid.");
        return getLogin(req, res);
    }

    var user: DKYUser.User;

    try {
        user = await DKYUser.login(req.body.email, req.body.password);
    } catch (error) {
        DKYSession.raiseMessage(req.session, "danger", "Authentication failed.");
        return getLogin(req, res);
    }

    DKYSession.raiseMessage(req.session, "success", `Authentication successful. Welcome ${user.email}.`);
    req.session["user_id"] = user.user_id;
    res.redirect("/");
}

export async function error404(req: Request, res: Response): Promise<void> {
    await sendHTML(req, res, {
        template: "404.html",
        title: "404 - Page Not Found"
    });
}

export async function error500(err: Error, req: Request, res: Response): Promise<void> {
    console.error(err);
    await sendHTML(req, res, {
        status: 500,
        template: "500.html",
        title: "500 - Error"
    });
}