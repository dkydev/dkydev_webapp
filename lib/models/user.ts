import * as bcrypt from "bcrypt";
import {ResultSet, Client, getClient} from "../db";

export class User {
    public user_id: number;
    public email: string;
    public password: string;
}

export function login(email: string, password: string): Promise<any> {
    var user: User;
    return getUserbyEmail(email).then((newUser: User) => {
        if (!newUser) throw new Error("User not found.");
        user = newUser;
        return validatePassword(password, user.password);
    }).then((result: boolean) => {
        if (result) {
            return user;
        } else {
            throw new Error("Bad password.");
        }
    });
}

export function validatePassword(password: string, encrypted: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, encrypted, (err: Error, result: boolean) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

export function getUserbyEmail(email: string): Promise<User> {
    return getClient().then((client: Client) => {
        return client.query<User>(`
            SELECT *
            FROM "user" 
            WHERE email = $1
        `, [email]);
    }).then((resultSet: ResultSet<User>) => {
        if (resultSet.rows.length == 0) {
            return null;
        } else {
            return resultSet.rows.pop();
        }
    });
}