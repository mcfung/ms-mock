import _ from 'lodash';
import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import handlers from "./handlers";
import matchers from "../common/matchers"
import Debug from "debug";

const debug = Debug("ms-mock-core:app");

interface RouteConfig {
    type: string;
    [key: string]: any;
}

interface Plugin {
    matchers?: Record<string, any>;
    handlers?: Record<string, any>;
}

interface Context {
    app: Application;
    basePath: string;
    config: RouteConfig;
    customFs?: any;
}

function buildApp(routes: RouteConfig[], logStream: any, customFs: any, configBasePath: string, plugins: (string | Plugin)[] = []): Application {
    let resultantPlugin = _.reduce(plugins, (result: Plugin, plugin: string | Plugin) => {
        debug("Applying plugin: %o", plugin);

        const loadedPlugin: Plugin = typeof plugin === 'string' ? require(`ms-mock-${plugin}`) : plugin;

        return {
            matchers: {...result.matchers, ...(loadedPlugin ? loadedPlugin.matchers : undefined)},
            handlers: {...result.handlers, ...(loadedPlugin ? loadedPlugin.handlers : undefined)},
        }
    }, {});

    const app: Application = express();

    app.locals.matchers = {
        ...matchers,
        ...resultantPlugin.matchers
    };

    app.locals.handlers = {
        ...handlers,
        ...resultantPlugin.handlers
    };

    app.use(logger(function (tokens, req, res) {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms'
        ].join(' ')
    }, {stream: logStream}));
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());

    debug("Applying routes...");
    _.forEach(routes, (c: RouteConfig) => {

        const context: Context = {
            app,
            basePath: configBasePath,
            config: c,
            customFs
        };


        let handle = app.locals.handlers[c.type];
        if (typeof handle === "function") {
            handle(context);
        } else {
            throw "Unsupported Type: " + c.type
        }
    });
    debug("Applied routes");

    // error handler
    app.use(function (err: any, req: Request, res: Response, next: NextFunction) {

        // render the error page
        res.status(err.status || 500);
        res.send(err.message).end();
    });

    return app;
}

export default buildApp;
