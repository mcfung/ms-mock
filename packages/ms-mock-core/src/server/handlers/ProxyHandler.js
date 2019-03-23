import proxy from "express-http-proxy";

export default ({app, config}) => {
    app.use(config.path, proxy(config.host, {
        proxyReqPathResolver: (req) => {
            const parts = req.url.split('?');
            const queryString = parts[1];
            return config.path  + (queryString ? '?' + queryString : '');
        },
        parseReqBody: false,
        userResHeaderDecorator: (headers) => {
            headers['Access-Control-Allow-Origin'] = '*';
            headers['Access-Control-Allow-Headers'] = '*';
            return headers;
        }
    }));
}