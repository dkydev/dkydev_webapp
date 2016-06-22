import {Request, Response} from "express";

export function index(req: Request, res: Response) {
    res.render("layout.html", { title: "dkydev.com home", template: "home.html" })
}