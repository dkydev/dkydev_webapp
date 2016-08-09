import {ResultSet, Client, getClient} from "../db";
import * as moment from "moment";
import * as validator from "validator";

export class Post {
    public post_id: number;
    public post_title: string;
    public post_date: string;
    public post_body: string;
    public post_status: string;
    public post_labels: string[];
    constructor(obj: any) {
        this.post_id = obj.post_id;
        this.post_title = obj.post_title;
        this.post_date = obj.post_date;
        this.post_body = obj.post_body;
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
        if (!obj.post_body || !validator.isLength(obj.post_body, { max: 10000 }))
            return false;
        return true;
    }
}

export function removePost(post_id: number): Promise<any> {
    var client: Client;
    return getClient()
        .then((newClient: Client) => {
            client = newClient;
            return client.query<Post>(`DELETE FROM post WHERE post.post_id = $1;`, [post_id]);
        }).then(() => {
            return client.query<any>(`DELETE FROM post_label WHERE post_label.post_id = $1;`, [post_id]);
        });
}

export function savePost(post: Post): Promise<any> {
    var post_date = moment(post.post_date, "MMM DD, YYYY").unix();
    var client: Client;
    if (post.post_id) {
        return getClient()
            .then((newClient: Client) => {
                client = newClient;
                return client.query<Post>(`
                    UPDATE post 
                    SET 
                        post_title = $1,
                        post_date = $2,
                        post_body = $3,
                        post_status = $4
                    WHERE
                        post.post_id = $5;
                `, [post.post_title, post_date, post.post_body, post.post_status, post.post_id]);
            }).then(() => {
                return client.query<any>(`DELETE FROM post_label WHERE post_label.post_id = $1;`, [post.post_id]);
            }).then(() => {
                return Promise.all(post.post_labels.map((post_label: string) => {
                    return client.query<any>(`INSERT INTO post_label(post_id, post_label) VALUES ($1, $2)`, [post.post_id, post_label]);
                }));
            });
    } else {
        return getClient().then((newClient: Client) => {
            client = newClient;
            return client.query<any>(`INSERT INTO post(post_title, post_date, post_body, post_status) VALUES ($1, $2, $3, $4) RETURNING post_id`, [post.post_title, post_date, post.post_body, post.post_status]);
        }).then((resultSet: ResultSet<any>) => {
            return Promise.all(post.post_labels.map((post_label: string) => {
                return client.query<any>(`INSERT INTO post_label(post_id, post_label) VALUES ($1, $2)`, [resultSet.rows[0].post_id, post_label]);
            }));
        });
    }
}

export function getBlogPosts(): Promise<Array<Post>> {
    return getClient().then((client: Client) => {
        return client.query<Post>(`
            SELECT post.*, array_agg(post_label.post_label) AS post_labels
            FROM post 
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            WHERE post.post_status = 'Enabled'
            GROUP BY post.post_id
            ORDER BY post.post_date DESC
        `);
    }).then((resultSet: ResultSet<Post>) => {
        return new Promise<Array<Post>>((resolve, reject) => {
            resolve(resultSet.rows.map<Post>((obj: any) => {
                obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");
                return new Post(obj);
            }));
        });
    });
}

export function getAllPosts(): Promise<Array<Post>> {
    return getClient().then((client: Client) => {
        return client.query<Post>(`
            SELECT post.*, array_agg(post_label.post_label) AS post_labels
            FROM post
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            GROUP BY post.post_id
            ORDER BY post.post_date DESC
        `);
    }).then((resultSet: ResultSet<Post>) => {
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
        return client.query<Post>(`
            SELECT post.*, array_agg(post_label.post_label) AS post_labels
            FROM post
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            WHERE post.post_id = $1
            GROUP BY post.post_id
        `, [post_id]);
    }).then((resultSet: ResultSet<Post>) => {
        return new Promise<Post>((resolve, reject) => {
            var obj: any = resultSet.rows.pop();
            obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");
            resolve(new Post(obj));
        });
    });
}