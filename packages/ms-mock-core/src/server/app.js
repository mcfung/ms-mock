import ServerLoggingStream from "../common/ServerLoggingStream";
import _ from 'lodash';
import proxy from 'express-http-proxy';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const buildRoute = require('./routes/index');

function buildApp(route, logStream: ServerLoggingStream, customFs, configBasePath) {

    const app = express();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');
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
        if (c.static) {
            app.use(express.static(c.path.startsWith("/") ? c.path : path.join(configBasePath, c.path)));
        } else if (c.proxy) {
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
        }
    });

    app.use('/', buildRoute(route, customFs));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

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

module.exports = buildApp;
