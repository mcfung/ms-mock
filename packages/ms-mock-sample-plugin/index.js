module.exports = {
    matchers: {
        "oneOf": (expected, actual) => {
            return expected.includes(actual);
        }
    },
    handlers: {
        "sample": ({app, config}) => {

            app.use(config.path, (req, res) => {
                res.status(200);
                res.send("Send by plugin: Sample").end();
            });
        }
    }
};