import * as express from "express";
import * as bodyParser from "body-parser";
import * as methodOverride from "method-override";
import * as helmet from "helmet";
import config from "../var/config";
import router from "./router";
import error from "./error";
import { DKYSessionHandler } from "./session";
import * as session from "express-session";
import { logger, errorLogger } from "./logger";
import * as le from "greenlock-express";
import * as http from "http";
import * as https from "https";
import * as redirecthttps from "redirect-https";

var app: express.Application = express();

app.use(logger());

app.use(helmet());

//app.use(DKYSessionHandler());

app.use(session({
    name: 'app.sid',
    secret: "1234567890QWERTY",
    resave: true,
    store: new session.MemoryStore(),
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(methodOverride());

app.use(express.static(__dirname + "/../public"));

app.use("/", router());

app.use(errorLogger());

app.use(error());

var lex = le.create({
    
    server: config.LE_URL,
    
    approveDomains: (opts, certs, cb) => {
        if (certs) {
            opts.domains = ['dkydev.com', 'images.dkydev.com', 'dkygames.com']
        } else {
            opts.email = 'nick@dkydev.com'; 
            opts.agreeTos = true;
        }
        cb(null, { options: opts, certs: certs });
    },

    app: app
    
});

require('http').createServer(lex.middleware(require('redirect-https')())).listen(config.PORT, function () {
    console.log("Listening for ACME http-01 challenges on", this.address());
});

// handles your app
require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(config.SSL_PORT, function () {
    console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
});