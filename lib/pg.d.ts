declare module "pg" {
    export class Pool {
        constructor(any);
        query(sql: string): Promise<any>
        connect(): Promise<Client>
        on(event: string, callback: (error: Client, client?: Client) => void): void;
    }
    export class Client {
        query<T>(sql: string, params?: any[]): Promise<ResultSet<T>>
        release(): void
    }
    export interface ResultSet<T> {
        rowCount: number,
        rows: Array<T>
    }
}