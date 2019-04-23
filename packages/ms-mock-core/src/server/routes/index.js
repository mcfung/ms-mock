import _ from 'lodash';
import fs from "fs";
import path from "path";
import Debug from "debug";

const debug = Debug("ms-mock-core:route");

export function addRoute(descriptor, app, customFs, basePath) {

    const matchers = app.locals.matchers;

    app[descriptor.method](descriptor.path, (req, res, next) => {

        const matchedCombination = _.find(descriptor.combinations, (criteria) => {

            const headers = criteria.headers;
            let headerCheck = _.reduce(headers, (result, header) => {
                if (result) {

                    const match = matchers[header.matchRule];
                    const matchResult = match && match(header.value, req.get(header.name));
                    if (!matchResult) {
                        debug("Unmatched header %o, value: %s", header, req.get(header.name));
                    }
                    return result && matchResult;
                } else {
                    return result;
                }
            }, true);

            const queries = criteria.query;
            let queryCheck = _.reduce(queries, (result, query) => {
                if (result) {

                    const match = matchers[query.matchRule];
                    const matchResult = match && match(query.value, req.query[query.name]);
                    if (!matchResult) {
                        debug("Unmatched query %o, value: %s", query, req.query[query.name]);
                    }
                    return result && matchResult;
                } else {
                    return result;
                }
            }, true);

            return !!(headerCheck && queryCheck);
        });

        if (matchedCombination) {

            if (matchedCombination.cors) {
                res.set("Access-Control-Allow-Origin", "*");
                res.set("Access-Control-Allow-Headers", "*");
            }

            _.forEach(matchedCombination.response.headers, (header) => {
                res.set(header.name, header.value);
            });

            const delay = matchedCombination.response.delay || 0;
            console.log(delay);
            setTimeout(() => {
                if (matchedCombination.response.fileContent) {
                    debug("sending file content");
                    try {

                        const finalFs = customFs || fs;
                        let file = path.isAbsolute(matchedCombination.response.filePath)
                            ? finalFs.readFileSync(matchedCombination.response.filePath)
                            : finalFs.readFileSync(path.join(basePath, matchedCombination.response.filePath));
                        res.status(matchedCombination.response.statusCode)
                            .send(file)
                            .end();
                    } catch (e) {
                        debug(e);
                        res.status(500).end();
                    }
                } else {
                    debug("sending non-file content");
                    res.status(matchedCombination.response.statusCode)
                        .send(matchedCombination.response.content)
                        .end();

                }
            }, delay);
        } else {
            res.set("text/plain");
            res.status(404).send("No combination found").end();
        }
    });
}
