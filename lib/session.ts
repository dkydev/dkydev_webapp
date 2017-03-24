import * as Express from "express";
import * as ExpressSession from "express-session";
import { getClient, Client, QueryResult } from "./db";
import * as moment from "moment";
import { EventEmitter } from "events";

export class Message {
    public static INFO: string = "info";
    public static SUCCESS: string = "success";
    public static DANGER: string = "danger";
    public static WARNING: string = "warning";

    public type: string;
    public text: string;
    constructor(type: string, text: string) {
        this.type = type;
        this.text = text;
    }
}

export function DKYSessionHandler(): Express.RequestHandler {
    return ExpressSession({
        store: sessionStore,
        secret: "banana",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
    });
}

export function raiseMessage(session: any, type: string, text: string): void {
    session["message"] = new Message(type, text);
}

export function getMessage(session: any): Message {
    var message: Message = session["message"];
    delete session["message"];
    return message;
}

export class DKYSessionStore extends ExpressSession.Store {
    public store: ExpressSession.Store
    public DKYStore(): void {
        //this.store = session.Store;
    }

    public destroy = (sid: string, callback: (error: any) => void): any => {
        getClient().then((client: Client) => {
            return client.query("DELETE FROM session WHERE sid = $1", [sid]);
        }).then(() => {
            callback(null);
        }).catch((error: any) => {
            callback(error);
        });
    }

    public get = (sid: string, callback: (error: any, result?: any) => void): any => {
        getClient().then((client: Client) => {
            return client.query("SELECT * FROM session WHERE sid = $1", [sid]);
        }).then((result: QueryResult) => {
            if (result.rowCount === 0) {
                callback(null, null);
            } else {
                callback(null, result.rows.shift().data);
            }
        }).catch((error: any) => {
            callback(error);
        });
    }

    public set = (sid: string, session: any, callback: (error: any) => void): any => {
        var client: Client;
        getClient().then((newClient: Client) => {
            client = newClient;
            return client.query("SELECT * FROM session WHERE sid = $1", [sid]);
        }).then((result: QueryResult) => {
            if (result.rowCount === 0) {
                return client.query("INSERT INTO session(sid, data, expire) VALUES ($1, $2, $3)", [sid, JSON.stringify(session), moment().add(30, "days").unix()]);
            } else {
                return client.query("UPDATE session SET data = $2, expire = $3 WHERE sid = $1", [sid, JSON.stringify(session), moment().add(30, "days").unix()]);
            }
        }).then(() => {
            callback(null);
        }).catch((error: any) => {
            callback(error);
        });
    }

    public touch = (sid: string, session: any, callback: (error: any) => void): any => {
        getClient().then((client: Client) => {
            return client.query("UPDATE session SET data = $2, expire = $3 WHERE sid = $1", [sid, JSON.stringify(session), moment().add(30, "days").unix()]);
        }).then(() => {
            callback(null);
        }).catch((error: any) => {
            callback(error);
        });
    }

}

export var sessionStore = new DKYSessionStore();