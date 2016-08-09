import * as errorhandler from "errorhandler";
import * as defaultRoutes from "./routes/default";

export default function error(): any {
    if (process.env.NODE_ENV !== "development") {
        return defaultRoutes.error500;
    } else {
        return errorhandler();
    }
}