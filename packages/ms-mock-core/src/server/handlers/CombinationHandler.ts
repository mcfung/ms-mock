import { Application } from "express";
import {addRoute} from "../routes";

interface CombinationHandlerContext {
    app: Application;
    customFs?: any;
    basePath: string;
    config: any;
}

export default ({app, customFs, basePath, config}: CombinationHandlerContext): void => {

    addRoute(config, app, customFs, basePath);
}