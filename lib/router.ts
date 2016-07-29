import {Router, Request, Response} from "express";
import * as defaultRoutes from "./routes/default";
import * as postRoutes from "./routes/post";

export default function (): Router {

    var router: Router = Router();

    // Routes.
    router.all("/", (req: Request, res: Response, next: (error: any) => any) => {
        defaultRoutes.index(req, res).catch(next);
    });
    router.all("/post/:action?/:id?", (req: Request, res: Response, next: (error: any) => any) => {
        postRoutes.post(req, res).catch(next);
    });
    // Catch all.
    router.all("*", (req: Request, res: Response, next: (error: any) => any) => {
        defaultRoutes.error404(req, res).catch(next);
    });

    return router;
}