import express, { Application } from "express";
import path from "path";

interface StaticHandlerContext {
    app: Application;
    basePath: string;
    config: {
        path: string;
        [key: string]: any;
    };
}

export default ({app, basePath, config}: StaticHandlerContext): void => {

    app.use(express.static(path.isAbsolute(config.path) ? config.path : path.join(basePath, config.path)));
}