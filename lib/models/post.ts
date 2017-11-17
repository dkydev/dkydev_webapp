import {QueryResult, Client, getClient} from "../db";
import * as moment from "moment";
import * as validator from "validator";

export class Post {

    public post_id: number;
    public post_title: string;
    public post_ts: number;
    public post_date: string;
    public post_body: string;
    public post_markdown: string;
    public post_intro: string;
    public post_intro_markdown: string;
    public post_image: string;
    public post_status: string;
    public post_labels: string[];
    public post_alias: string;

    constructor(obj: any) {
        this.post_id = obj.post_id;
        this.post_title = obj.post_title;
        this.post_ts = obj.post_ts;
        this.post_date = obj.post_date;
        this.post_body = obj.post_body;
        this.post_markdown = obj.post_markdown;
        this.post_intro = obj.post_intro;
        this.post_intro_markdown = obj.post_intro_markdown;
        this.post_image = obj.post_image;
        this.post_status = obj.post_status;
        this.post_labels = obj.post_labels ? obj.post_labels : [];
        this.post_alias = obj.post_alias;
    }

    public static isValid(obj: any): boolean {
        if (obj.post_id && !validator.isInt(obj.post_id))
            return false;
        if (!obj.post_date || !moment(obj.post_date, "MMM DD, YYYY").isValid())
            return false;
        if (!obj.post_status || !validator.isIn(obj.post_status, ["Enabled", "Disabled"]))
            return false;
        if (!obj.post_title || !validator.isLength(obj.post_title, {max: 255}))
            return false;
        if (!validator.isLength(obj.post_image, {max: 255}))
            return false;
        if (!validator.isLength(obj.post_intro_markdown, {max: 255}))
            return false;
        if (!obj.post_markdown || !validator.isLength(obj.post_markdown, {max: 10000}))
            return false;
        if (!obj.post_alias || !validator.isLength(obj.post_alias, {min: 5, max: 255}))
            return false;
        return true;
    }
}

export async function removePost(post_id: number): Promise<void> {
    var client: Client = await getClient();

    await Promise.all([
        client.query(`DELETE FROM post WHERE post.post_id = $1;`, [post_id]),
        client.query(`DELETE FROM post_label WHERE post_label.post_id = $1;`, [post_id])
    ]);
}

function renderMarkdown(markdown: string): string {
    var hljs = require('highlight.js');
    var md = require("markdown-it")({
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) {
                }
            }
            return ''; // use external default escaping
        },
        html: true
    });

    return md.render(markdown);
}

export async function savePost(post: Post): Promise<void> {
    post.post_ts = moment(post.post_date, "MMM DD, YYYY").unix();
    post.post_intro = renderMarkdown(post.post_intro_markdown);
    post.post_body = renderMarkdown(post.post_markdown);
    var client: Client = await getClient();
    if (post.post_id) {
        // Update post.
        await client.query(`
            UPDATE post 
            SET 
                post_title = $1,
                post_date = $2,
                post_markdown = $3,
                post_status = $4,
                post_body = $5,
                post_intro = $6,
                post_intro_markdown = $7,
                post_image = $8,
                post_alias = $9
            WHERE
                post.post_id = $10;
        `, [post.post_title, post.post_ts, post.post_markdown, post.post_status, post.post_body, post.post_intro, post.post_intro_markdown, post.post_image, post.post_alias, post.post_id]);

        // Delete labels.
        await client.query(`DELETE FROM post_label WHERE post_label.post_id = $1;`, [post.post_id]);
    } else {
        // Insert new post.
        var resultSet: QueryResult = await client.query(`
            INSERT INTO post(post_title, post_date, post_markdown, post_status, post_body, post_intro, post_intro_markdown, post_image) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING post_id
            `, [post.post_title, post.post_ts, post.post_markdown, post.post_status, post.post_body, post.post_intro, post.post_intro_markdown, post.post_image, post.post_alias]);

        // Set the post ID for label insert.
        post.post_id = resultSet.rows[0].post_id;
    }

    // Insert new labels.
    await Promise.all(post.post_labels.map((post_label: string) => client.query(`INSERT INTO post_label(post_id, post_label) VALUES ($1, $2)`, [post.post_id, post_label])));
}

export async function getBlogPosts(label: string = null, page: number = 1): Promise<Post[]> {
    var limit: number = 5;
    var offset: number = (page - 1) * limit;
    var client: Client = await getClient();
    var resultSet: QueryResult
    if (label) {
        // Filter by label.
        resultSet = await client.query(`
                SELECT post.*, array_agg(post_label.post_label) AS post_labels
                FROM post 
                LEFT JOIN post_label ON post_label.post_id = post.post_id 
                WHERE post.post_status = 'Enabled' AND post_label.post_label = $1
                GROUP BY post.post_id ORDER BY post.post_date DESC LIMIT $2 OFFSET $3`, [label, limit, offset]);
    } else {
        // No label filter.
        resultSet = await client.query(`
                SELECT post.*, array_agg(post_label.post_label) AS post_labels
                FROM post 
                LEFT JOIN post_label ON post_label.post_id = post.post_id 
                WHERE post.post_status = 'Enabled'
                GROUP BY post.post_id ORDER BY post.post_date DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    }

    return resultSet.rows.map<Post>((obj: any) => {
        obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");
        return new Post(obj);
    });
}

export async function getNext(label: string = null, page: number = 1): Promise<number> {
    var limit: number = 5;
    var client: Client = await getClient();
    var resultSet: QueryResult;
    if (label) {
        // Filter by label.
        resultSet = await client.query(`
            SELECT COUNT(*) AS post_count
            FROM post
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            WHERE post.post_status = 'Enabled' AND post_label.post_label = $1`, [label]);
    } else {
        // No label filter.
        resultSet = await client.query(`
            SELECT COUNT(*) AS post_count
            FROM post
            WHERE post.post_status = 'Enabled'`);
    }

    if (resultSet.rows[0].post_count > limit * page) {
        return page + 1;
    } else {
        return page;
    }
}

export async function getAllPosts(): Promise<Array<Post>> {
    var client: Client = await getClient();
    var resultSet: QueryResult = await client.query(`
            SELECT post.*, array_agg(post_label.post_label) AS post_labels
            FROM post
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            GROUP BY post.post_id
            ORDER BY post.post_date DESC
        `);

    return resultSet.rows.map<Post>((obj: any) => {
        obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");
        return new Post(obj);
    });
}

export async function getPost(post_id: number): Promise<Post> {
    var client: Client = await getClient();
    var resultSet: QueryResult = await  client.query(`
            SELECT post.*, array_agg(post_label.post_label) AS post_labels
            FROM post
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            WHERE post.post_id = $1
            GROUP BY post.post_id
        `, [post_id]);

    if (resultSet.rows.length == 0) {
        throw new Error("Post not found.");
    }

    var obj: any = resultSet.rows.pop();
    obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");

    return new Post(obj);
}

export async function getPostByAlias(post_alias: string): Promise<Post> {
    var client: Client = await getClient();
    var resultSet: QueryResult = await client.query(`
            SELECT post.*, array_agg(post_label.post_label) AS post_labels
            FROM post
            LEFT JOIN post_label ON post_label.post_id = post.post_id 
            WHERE post.post_alias = $1
            GROUP BY post.post_id
        `, [post_alias]);

    if (resultSet.rows.length == 0) {
        throw new Error("Post not found.");
    }

    var obj: any = resultSet.rows.pop();
    obj.post_date = moment.unix(obj.post_date).format("MMM D, YYYY");

    return new Post(obj);
}