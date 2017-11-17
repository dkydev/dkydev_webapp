import * as bcrypt from "bcrypt-nodejs";
import {QueryResult, Client, getClient} from "../db";

export class User {
    public user_id: number;
    public email: string;
    public password: string;
}

export async function login(email: string, password: string): Promise<User> {
    var user: User = await getUserByEmail(email);
    if (!user) throw new Error("User not found.");

    var isValid: boolean = await validatePassword(password, user.password);

    if (isValid) {
        return user;
    } else {
        throw new Error("Bad password.");
    }
}

export async function validatePassword(password: string, encrypted: string): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(password, encrypted, (err: Error, result: boolean) => {
            if (err) {
                resolve(false);
            }
            resolve(result);
        });
    });
}

export async function getUserByEmail(email: string): Promise<User> {
    var client: Client = await getClient();
    var resultSet: QueryResult = await client.query(`
            SELECT *
            FROM "user" 
            WHERE email = $1
        `, [email]);

    if (resultSet.rows.length == 0) {
        throw new Error("User not found.");
    } else {
        return resultSet.rows.pop();
    }
}