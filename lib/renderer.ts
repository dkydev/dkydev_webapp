import * as fs from "fs";
import * as mustache from "mustache";
import {Request, Response, RequestHandler} from "express";
import * as DKYSession from "./session";
import * as moment from 'moment';
import config from "../var/config";

export default async function sendHTML(req: Request, res: Response, data: any): Promise<void> {
    data.status = data.status || 200;
    data.title = data.title || "dkydev";
    data.year = moment().year();
    data.message = DKYSession.getMessage(req.session);
    data.host = config.HOST;

    var html: string = await renderLayout(data.template, data);
    res.status(data.status).send(html);
}

export async function renderLayout(template: string, data: any): Promise<string> {
    var bodyString: string = await getTemplate(template);
    var layoutString: string = await getTemplate("layout.html");

    return mustache.render(layoutString, data, {body: bodyString})
}

async function getTemplate(template: string): Promise<string> {
    return await new Promise<string>((resolve, reject: (message: string) => void) => {
        fs.readFile(`${__dirname}/views/${template}`, "utf8", (error: NodeJS.ErrnoException, data: string) => {
            if (error) {
                reject(error.message);
                console.error(error);
            }
            resolve(data);
        })
    });
}