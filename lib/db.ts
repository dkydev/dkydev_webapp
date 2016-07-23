import config from "../var/config";
import {Pool, Client, ResultSet} from "pg";

var pool: Pool = new Pool({
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    database: config.DATABASE_NAME,
    user: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD
});

export function getClient(): Promise<Client> {
    return pool.connect().then((client:Client) => {
        return new Promise<Client>((resolve:(client:Client) => void, reject) => {
           resolve(client);
           client.release(); 
        });
    });
}

export {Client, ResultSet};