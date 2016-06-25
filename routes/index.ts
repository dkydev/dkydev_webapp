import {Request, Response} from "express";

export function index(req: Request, res: Response): void {
    res.render("layout.html", { title: "dkydev.com home", template: "home.html" })
}

export function edit(req: Request, res: Response): void {
    res.render("layout.html", { 
        title: "dkydev.com edit",
        template: "edit.html",
        post : {
            post_id : null,
            post_date : null,
            post_labels : null,
            post_title : null,
            post_body : null,
        }, 
    })
}

export function error404(req: Request, res: Response): void {
    res.status(404).render("layout.html", {
        title: "404 - dkydev",
        template: "404.html"
    });
}