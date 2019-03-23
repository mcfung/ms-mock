import _ from 'lodash';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import handlers from "./handlers";

function buildApp(routes, logStream, customFs, configBasePath, plugins) {

    let resultantPlugin = _.reduce(plugins, (result, plugin) => {
        return {...result, ...require(`ms-mock-${plugin}`)}
    }, {});

    const app = express();

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

    _.forEach(routes, c => {

        const context = {
            app,
            basePath: configBasePath,
            config: c,
            customFs,
            pluginMatchers: resultantPlugin.matchers
        };

        const augmentedHandlers = {...handlers, ...resultantPlugin.handlers};

        let handle = augmentedHandlers[c.type];
        if (typeof handle === "function") {
            handle(context);
        } else {
            throw "Unsupported Type: " + c.type
        }
    });

    // error handler
    app.use(function (err, req, res, next) {

        // render the error page
        res.status(err.status || 500);
        res.send(err.message).end();
    });

    return app;
}

export default buildApp;
