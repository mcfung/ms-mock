import proxy from "express-http-proxy";
import Debug from "debug";

const debug = Debug("ms-mock-core:proxy-handler");

export default ({app, config}) => {

    debug("Proxy Options for %s: %o", config.path, config.proxyOptions);

    const options = {
        proxyReqPathResolver: (req) => {
            return req.originalUrl;
        },
        ...config.proxyOptions
    };

    if (config.cors) {
        debug("Adding userResHeaderDecorator for CORS");
        options.userResHeaderDecorator = (headers) => {
            headers['Access-Control-Allow-Origin'] = '*';
            headers['Access-Control-Allow-Headers'] = '*';
            return headers;
        }
    }

    debug("Applying proxy middleware for %s..", config.path);

    app.use(config.path, proxy(config.host, options));
}