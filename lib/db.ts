import config from "../var/config";
import {Pool, Client, ResultSet} from "pg";

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
            client.on("error", reject);
            resolve(client);
            client.release();
        });
    }).catch((error: any): any => {
        if (client)
            client.release();
        throw error;
    });
}

export {Client, ResultSet};