import { QueryResult, Client, getClient } from "../db";
import * as moment from "moment";
import * as validator from "validator";

export class Post {
    public post_id: number;
    public post_title: string;
    public post_ts: number;
    public post_date: string;
    public post_body: string;
    public post_markdown: string;
    public post_status: string;
    public post_labels: string[];
    constructor(obj: any) {
        this.post_id = obj.post_id;
        this.post_title = obj.post_title;
        this.post_ts = obj.post_ts;
        this.post_date = obj.post_date;
        this.post_body = obj.post_body;
        this.post_markdown = obj.post_markdown;
        this.post_status = obj.post_status;
        this.post_labels = obj.post_labels ? obj.post_labels : [];
    }
    public static isValid(obj: any): boolean {
        if (obj.post_id && !validator.isInt(obj.post_id))
            return false;
        if (!obj.post_date || !moment(obj.post_date, "MMM DD, YYYY").isValid())
            return false;
        if (!obj.post_status || !validator.isIn(obj.post_status, ["Enabled", "Disabled"]))
            return false;
        if (!obj.post_title || !validator.isLength(obj.post_title, { max: 255 }))
            return false;
        if (!obj.post_markdown || !validator.isLength(obj.post_markdown, { max: 10000 }))
            return false;
        return true;
    }
}

export function removePost(post_id: number): Promise<QueryResult> {
    return getClient().then((client: Client) => {
        return client.query(`DELETE FROM post WHERE post.post_id = $1;`, [post_id]);
    }).then((result: QueryResult) => {
        return removePostLabels(post_id);
    });
}

export function removePostLabels(post_id: number): Promise<QueryResult> {
    return getClient().then((client: Client) => client.query(`DELETE FROM post_label WHERE post_label.post_id = $1;`, [post_id]));
}

function renderMarkdown(markdown: string): string {
    var hljs = require('highlight.js');
    var md = require("markdown-it")({
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) { }
            }
            return ''; // use external default escaping
        }
    });

    return md.render(markdown);
}

export function savePost(post: Post): Promise<any> {
    post.post_ts = moment(post.post_date, "MMM DD, YYYY").unix();
    post.post_body = renderMarkdown(post.post_markdown);
    var client: Client;
    if (post.post_id) {
        return getClient()
            .then((newClient: Client) => {
                client = newClient;
                return client.query(`
                    UPDATE post 
                    SET 
                        post_title = $1,
                        post_date = $2,
                        post_markdown = $3,
                        post_status = $4,
                        post_body = $5
                    WHERE
                        post.post_id = $6;
                `, [post.post_title, post.post_ts, post.post_markdown, post.post_status, post.post_body, post.post_id]);
            }).then(() => {
                return client.query(`DELETE FROM post_label WHERE post_label.post_id = $1;`, [post.post_id]);
            }).then(() => {
                return Promise.all(post.post_labels.map((post_label: string) => {
                    return client.query(`INSERT INTO post_label(post_id, post_label) VALUES ($1, $2)`, [post.post_id, post_label]);
                }));
            });
    } else {
        return getClient().then((newClient: Client) => {
            client = newClient;
            return client.query(`INSERT INTO post(post_title, post_date, post_markdown, post_status, post_body) VALUES ($1, $2, $3, $4, $5) RETURNING post_id`, [post.post_title, post.post_ts, post.post_markdown, post.post_status, post.post_body]);
        }).then((resultSet: QueryResult) => {
            return Promise.all(post.post_labels.map((post_label: string) => {
                return client.query(`INSERT INTO post_label(post_id, post_label) VALUES ($1, $2)`, [resultSet.rows[0].post_id, post_label]);
            }));
        });
    }
}

export function getBlogPosts(label: string = null, page: number = 1): Promise<Post[]> {
    var limit: number = 5;
    var offset: number = (page - 1) * limit;
    return getClient().then((client: Client) => {
        if (label) {
            return client.query(`
                SELECT post.*, array_agg(post_label.post_label) AS post_labels
                FROM post 
                LEFT JOIN post_label ON post_label.post_id = post.post_id 
                WHERE post.post_status = 'Enabled' AND post_label.post_label = $1
                GROUP BY post.post_id ORDER BY post.post_date DESC LIMIT $2 OFFSET $3`, [label, limit, offset]);
        } else {
            return client.query(`
                SELECT post.*, array_agg(post_label.post_label) AS post_labels
                FROM post 
                LEFT JOIN post_label ON post_label.post_id = post.post_id 
                WHERE post.post_status = 'Enabled'
                GROUP BY post.post_id ORDER BY post.post_date DESC LIMIT $1 OFFSET $2`, [limit, offset]);
        }
    }).then((resultSet: QueryResult) => {
        return new Promise<Array<Post>>((resolve, reject) => {
            resolve(resultSet.rows.map<Post>((obj: any) => {
                obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");
                return new Post(obj);
            }));
        });
    });
}

export function getNext(label: string = null, page: number = 1):Promise<number> {
    var limit: number = 5;
    var offset: number = (page - 1) * limit;
    return getClient().then((client: Client) => {
        if (label) {
            return client.query(`
                SELECT COUNT(*) AS post_count
                FROM post
                LEFT JOIN post_label ON post_label.post_id = post.post_id 
                WHERE post.post_status = 'Enabled' AND post_label.post_label = $1`, [label]);
        } else {
            return client.query(`
                SELECT COUNT(*) AS post_count
                FROM post
                WHERE post.post_status = 'Enabled'`);
        }
    }).then((resultSet: QueryResult) => {
        return new Promise<number>((resolve, reject) => {
            if (resultSet.rows[0].post_count > limit * page) {
                resolve(page + 1);
            } else {
                resolve(page);
            }
        });
    });
}

export function getAllPosts(): Promise<Array<Post>> {
    return getClient().then((client: Client) => {
        return client.query(`
            SELECT post.*, array_agg(post_label.post_label) AS post_labels
            FROM post
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            GROUP BY post.post_id
            ORDER BY post.post_date DESC
        `);
    }).then((resultSet: QueryResult) => {
        return new Promise<Array<Post>>((resolve, reject) => {
            resolve(resultSet.rows.map<Post>((obj: any) => {
                obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");
                return new Post(obj);
            }));
        });
    });
}

export function getPost(post_id: number): Promise<Post> {
    return getClient().then((client: Client) => {
        return client.query(`
            SELECT post.*, array_agg(post_label.post_label) AS post_labels
            FROM post
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            WHERE post.post_id = $1
            GROUP BY post.post_id
        `, [post_id]);
    }).then((resultSet: QueryResult) => {
        return new Promise<Post>((resolve, reject) => {
            var obj: any = resultSet.rows.pop();
            obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");
            resolve(new Post(obj));
        });
    });
}