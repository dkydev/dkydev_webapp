import config from "./config";
import * as moment from "moment";
import {Pool, Client, ResultSet} from "pg";

export var pool: Pool = new Pool({
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    database: config.DATABASE_NAME,
    user: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD
});

function getClient(): Promise<Client> { 
    return pool.connect();
}

export interface Post {
    post_id: number;
    post_title: string;
    post_date: any;
    post_body: string;
    post_status: string;s
}

export function getPosts(): Promise<Array<Post>> {
    return getClient().then((client: Client) => {
        return new Promise<ResultSet<Post>>((resolve, reject) => {
            resolve(client.query<Post>("SELECT * FROM post WHERE post_status = 'enabled' ORDER BY post_date DESC"));
        });
    }).then((resultSet: ResultSet<Post>) => {
        return new Promise<Array<Post>>((resolve, reject) => {
            resolve(resultSet.rows);
        });
    });
}

export function getPost(post_id: number): Promise<Post> {
    return getClient().then((client: Client) => {
        return new Promise<ResultSet<Post>>((resolve, reject) => {
            resolve(client.query<Post>("SELECT * FROM post WHERE post_id = $1", [post_id]));
        });
    }).then((resultSet: ResultSet<Post>) => {
        return new Promise<Post>((resolve, reject) => {
            resolve(resultSet.rows.pop());
        });
    });
}