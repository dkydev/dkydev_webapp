import * as DB from "../db";

export interface Post {
    post_id: number;
    post_title: string;
    post_date: any;
    post_body: string;
    post_status: string;
}

export function getPosts(): Promise<Array<Post>> {
    return DB.getClient().then((client: DB.Client) => {
        return new Promise<DB.ResultSet<Post>>((resolve, reject) => {
            resolve(client.query<Post>("SELECT * FROM post WHERE post_status = 'enabled' ORDER BY post_date DESC"));
        });
    }).then((resultSet: DB.ResultSet<Post>) => {
        return new Promise<Array<Post>>((resolve, reject) => {
            resolve(resultSet.rows);
        });
    });
}

export function getPost(post_id: number): Promise<Post> {
    return DB.getClient().then((client: DB.Client) => {
        return new Promise<DB.ResultSet<Post>>((resolve, reject) => {
            resolve(client.query<Post>("SELECT * FROM post WHERE post_id = $1", [post_id]));
        });
    }).then((resultSet: DB.ResultSet<Post>) => {
        return new Promise<Post>((resolve, reject) => {
            resolve(resultSet.rows.pop());
        });
    });
}