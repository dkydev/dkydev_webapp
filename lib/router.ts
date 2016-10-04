import {Router, Request, Response} from "express";
import * as defaultRoutes from "./routes/default";
import * as postRoutes from "./routes/post";
import * as DKYSession from "./session";

export default function (): Router {

    var router: Router = Router();

    var authenticate = (req: Request, res: Response, next: any) => {
        if (!req.session["user_id"]) {
            DKYSession.raiseMessage(req.session, "danger", "You are not logged in.");
            res.redirect("/login");
        } else {
            next();
        }
    }

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
    router.get("/logout", authenticate, (req: Request, res: Response, next: any) => {
        defaultRoutes.getLogout(req, res).catch(next);
    });
    router.post("/logout", authenticate, (req: Request, res: Response, next: any) => {
        defaultRoutes.logout(req, res).catch(next);
    });
    router.all("/post/:action?/:id?", authenticate, (req: Request, res: Response, next: any) => {
        postRoutes.post(req, res).catch(next);
    });
    // Catch all.
    router.all("*", (req: Request, res: Response, next: any) => {
        defaultRoutes.error404(req, res).catch(next);
    });

    return router;
}