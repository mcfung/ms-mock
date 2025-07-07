import proxy from "express-http-proxy";
import { Application, Request, RequestHandler } from "express";
import Debug from "debug";

const debug = Debug("ms-mock-core:proxy-handler");

interface ProxyHandlerContext {
    app: Application;
    config: {
        path: string;
        host: string;
        cors?: boolean;
        proxyOptions?: Record<string, any>;
        [key: string]: any;
    };
}

export default ({app, config}: ProxyHandlerContext): void => {

    debug("Proxy Options for %s: %o", config.path, config.proxyOptions);

    const options: Record<string, any> = {
        proxyReqPathResolver: (req: Request) => {
            return req.originalUrl;
        },
        ...config.proxyOptions
    };

    if (config.cors) {
        debug("Adding userResHeaderDecorator for CORS");
        options.userResHeaderDecorator = (headers: Record<string, any>) => {
            headers['Access-Control-Allow-Origin'] = '*';
            headers['Access-Control-Allow-Headers'] = '*';
            return headers;
        }
    }

    debug("Applying proxy middleware for %s..", config.path);

    app.use(config.path, proxy(config.host, options) as any);
}