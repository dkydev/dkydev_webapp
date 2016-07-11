/// <reference path="globals/body-parser/index.d.ts" />
/// <reference path="globals/consolidate/index.d.ts" />
/// <reference path="globals/errorhandler/index.d.ts" />
/// <reference path="globals/es6-promise/index.d.ts" />
/// <reference path="globals/express-serve-static-core/index.d.ts" />
/// <reference path="globals/express/index.d.ts" />
/// <reference path="globals/method-override/index.d.ts" />
/// <reference path="globals/mime/index.d.ts" />
/// <reference path="globals/mustache/index.d.ts" />
/// <reference path="globals/node/index.d.ts" />
/// <reference path="globals/serve-static/index.d.ts" />

declare module "pg" {
    export class Pool {
        constructor(any);
        query(string): Promise<any>
        connect(): Promise<Client>
    }
    export class Client {
        query<T>(string): Promise<ResultSet<T>>
        release(): void
    }
    export interface ResultSet<T> {
        rowCount: number,
        rows: Array<T>
    }
}