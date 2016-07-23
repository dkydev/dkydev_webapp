import {Request, Response} from "express";
import * as moment from "moment";
import * as post from "../models/post";
import * as renderer from "../renderer";

export function index(req: Request, res: Response): Promise<any> {
    return post.getPosts().then((posts: Array<post.Post>) => {
        renderer.renderLayout("home.html", {
            title: "dkydev.com home",
            posts: posts.map((post: post.Post) => {
                post.post_date = moment(post.post_date * 1000).format("MMM D, YYYY");
                return post;
            })
        }).then((html: string) => {
            res.status(200).send(html);
        });
    });
};

export function error404(req: Request, res: Response): Promise<any> {
    return renderer.renderLayout("404.html", { title: "404 - dkydev" }).then((html: string) => {
        res.status(200).send(html);
    });
}

export function error500(err: Error, req: Request, res: Response, next: any): Promise<any> {
    return renderer.renderLayout("500.html", { title: "500 - dkydev" }).then((html: string) => {
        res.status(500).send(html);
    });
}