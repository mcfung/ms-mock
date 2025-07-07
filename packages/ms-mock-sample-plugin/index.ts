import { Application, Request, Response } from "express";

interface SampleHandlerContext {
    app: Application;
    config: {
        path: string;
        [key: string]: any;
    };
}

export default {
    matchers: {
        "oneOf": (expected: any[], actual: any): boolean => {
            return expected.includes(actual);
        }
    },
    handlers: {
        "sample": ({app, config}: SampleHandlerContext): void => {

            app.use(config.path, (req: Request, res: Response) => {
                res.status(200);
                res.send("Send by plugin: Sample").end();
            });
        }
    }
};