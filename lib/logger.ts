import config from "../var/config";
import * as winston from "winston";

var expressWinston: any = require("express-winston");
var winstonOptions: any = {
    transports: [
        new winston.transports.File({
            maxsize: 67108864,
            maxFiles: 100,
            tailable: true,
            level: config.LOG_LEVEL,
            filename: "log/app_log.txt"
        })
    ]
};

export function logger(): any {
    return expressWinston.logger(winstonOptions)
}

export function errorLogger() {
    return expressWinston.errorLogger(winstonOptions)
}
