import config from "../var/config";
import * as pg from "pg";
import {Pool, Client, QueryResult} from "pg";

// `postgresql://${config.DATABASE_USERNAME}:${config.DATABASE_PASSWORD}@#${config.DATABASE_HOST}/${config.DATABASE_NAME}:${config.DATABASE_PORT}`;

var pool: Pool = new Pool({
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    database: config.DATABASE_NAME,
    user: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD
});

pool.on("error", (error, client) => {
    return error;
});

export function getClient(): Promise<Client> {
    var client: Client;
    return pool.connect().then((newClient: Client) => {
        client = newClient;
        return new Promise<Client>((resolve: (client: Client) => void, reject) => {
            resolve(client);
            client.release();
        });
    }).catch((error: any): any => {
        if (client)
            client.release();
        throw error;
    });
}

export {pg, pool, Client, QueryResult};