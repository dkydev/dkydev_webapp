import {Router, Request, Response} from "express";
import * as defaultRoutes from "./routes/default";
import * as postRoutes from "./routes/post";
import * as DKYSession from "./session";

export default function (): Router {

    var router: Router = Router();

    // Routes.
    router.all("/", (req: Request, res: Response, next: any) => {
        defaultRoutes.index(req, res).catch(next);
    });
    router.get("/login", (req: Request, res: Response, next: any) => {
        defaultRoutes.getLogin(req, res).catch(next);
    });
    router.post("/login", (req: Request, res: Response, next: any) => {
        defaultRoutes.login(req, res).catch(next);
    });
    router.all("/post/:action?/:id?", (req: Request, res: Response, next: any) => {
        if (!req.session["user_id"]) {
            DKYSession.raiseMessage(req.session, "danger", "Permission denied.");
            res.redirect("/");
        } else {
            next();
        }
    }, (req: Request, res: Response, next: any) => {
        postRoutes.post(req, res).catch(next);
    });
    // Catch all.
    router.all("*", (req: Request, res: Response, next: any) => {
        defaultRoutes.error404(req, res).catch(next);
    });

    return router;
}