import _ from 'lodash';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import handlers from "./handlers";
import matchers from "../common/matchers"
import Debug from "debug";

const debug = Debug("ms-mock-core:app");

function buildApp(routes, logStream, customFs, configBasePath, plugins) {
    let resultantPlugin = _.reduce(plugins, (result, plugin) => {
        debug("Applying plugin: %o", plugin);

        const loadedPlugin = typeof plugin === 'string' ? require(`ms-mock-${plugin}`) : plugin;

        return {
            matchers: {...result.matchers, ...(loadedPlugin ? loadedPlugin.matchers : undefined)},
            handlers: {...result.handlers, ...(loadedPlugin ? loadedPlugin.handlers : undefined)},
        }
    }, {});

    const app = express();

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
    _.forEach(routes, c => {

        const context = {
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
    app.use(function (err, req, res, next) {

        // render the error page
        res.status(err.status || 500);
        res.send(err.message).end();
    });

    return app;
}

export default buildApp;
