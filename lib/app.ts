import * as express from "express";
import * as bodyParser from "body-parser";
import * as methodOverride from "method-override";
import config from "../var/config";
import router from "./router";
import error from "./error";

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + "/../public"));
app.use("/", router());
app.use(error());

app.listen(config.PORT, () => {
    console.log("Listening on port %d in %s mode.", config.PORT, process.env.NODE_ENV);
});