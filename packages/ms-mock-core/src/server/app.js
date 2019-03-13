import ServerLoggingStream from "../common/ServerLoggingStream";
import _ from 'lodash';
import proxy from 'express-http-proxy';
import buildRoute from "./routes";
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

function buildApp(route, logStream: ServerLoggingStream, customFs, configBasePath) {

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

    _.forEach(route, c => {
        switch (c.type) {
            case 'static':
                app.use(express.static(c.path.isAbsolute(c.path) ? c.path : path.join(configBasePath, c.path)));
                break;
            case 'proxy':
                app.use(c.path, proxy(c.host, {
                    proxyReqPathResolver: (req) => {
                        const parts = req.url.split('?');
                        const queryString = parts[1];
                        return c.path  + (queryString ? '?' + queryString : '');
                    },
                    parseReqBody: false,
                    userResHeaderDecorator: (headers) => {
                        console.log(headers);
                        headers['Access-Control-Allow-Origin'] = '*';
                        headers['Access-Control-Allow-Headers'] = '*';
                        return headers;
                    }
                }));
                break;
            default:
                break;
        }
    });

    app.use('/', buildRoute(route, customFs));

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    return app;
}

export default buildApp;
