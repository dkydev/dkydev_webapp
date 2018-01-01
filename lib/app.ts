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

http.createServer(lex.middleware(redirecthttps())).listen(config.PORT, function () {
    console.log("Listening for ACME http-01 challenges on", this.address());
});

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

https.createServer(lex.httpsOptions, lex.middleware(app)).listen(config.SSL_PORT, function () {
    console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
});


var lex = le.create({
    
    server: config.LE_URL,
    
    approveDomains: (opts, certs, cb) => {
        if (certs) {
            opts.domains = ['dkydev.com', 'dkygames.com']
        } else {
            opts.email = 'nick@dkydev.com'; 
            opts.agreeTos = true;
        }
        cb(null, { options: opts, certs: certs });
    },
    
});

var lex = require('greenlock-express').create({
    server: 'production',
    challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '/tmp/acme-challenges' }) },
    store: require('le-store-certbot').create({ webrootPath: '/tmp/acme-challenges' }),
       approveDomains: function(opts, certs, cb) {
         if(certs) {
           opts.domains = ['domain1.com', 'domain2.com']
         } else {
           opts.email = 'youremail@example.com',
           opts.agreeTos = true;
         }
         cb(null, { options: opts, certs: certs });
       }
       });
       
       //Optional: Add this line if you want to redirect all your traffic to https
    require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
      console.log("Listening for ACME http-01 challenges on", this.address());
    });
    
    // handles your app 
    var server = require('https').createServer(lex.httpsOptions, lex.middleware(app))
    server.listen(443, function () {
      console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
    });