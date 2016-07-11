import config from "./config";
import * as moment from "moment";
import * as errorHandler from "errorhandler";

import * as pg from "pg";
//var pg: any = require('pg');

export var pool: pg.Pool = new pg.Pool({
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    database: config.DATABASE_NAME,
    user: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD
});

function getClient(): Promise<pg.Client> {
    return pool.connect();
}

interface Post {
    post_id: number,
    post_title: string,
    post_date: any,
    post_body: string,
    post_status: string
}

export function getPosts(): Promise<pg.ResultSet<Post>> {
    return getClient().then<pg.ResultSet<Post>>(client => {
        var res: Promise<pg.ResultSet<Post>> = client.query<Post>("SELECT * FROM post WHERE post_status = 'enabled' ORDER BY post_date DESC");
        client.release();
        return res;
    }).catch<any>(error => {
        console.error(error);
    });
}