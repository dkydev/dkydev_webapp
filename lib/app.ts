import * as express from "express";
import * as bodyParser from "body-parser";
import * as methodOverride from "method-override";
import * as helmet from "helmet";
import config from "../var/config";
import router from "./router";
import error from "./error";
import {DKYSessionHandler} from "./session";
import * as session from "express-session";
import {logger, errorLogger} from "./logger";

var app: express.Application = express();

app.use(logger());

app.use(helmet());

//app.use(DKYSessionHandler());

app.use(session({
    name : 'app.sid',
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

app.listen(config.PORT, () => {
    console.log("Listening on port %d in %s mode.", config.PORT, process.env.NODE_ENV);
});