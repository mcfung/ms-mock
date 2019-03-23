import _ from 'lodash';
import fs from "fs";
import path from "path";
import matchers from "../../common/matchers";
import Debug from "debug";

const debug = Debug("ms-mock-core:route");

export function addRoute(descriptor, app, customFs, basePath, pluginMatchers) {

    const augmentedMatchers = {...matchers, ...pluginMatchers};

    app[descriptor.method](descriptor.path, (req, res, next) => {

        const matchedCombination = _.find(descriptor.combinations, (criteria) => {

            const headers = criteria.headers;
            let headerCheck = _.reduce(headers, (result, header) => {
                const match = augmentedMatchers[header.matchRule];
                return result && match && match(header.value, req.get(header.name));
            }, true);

            const queries = criteria.query;
            let queryCheck = _.reduce(queries, (result, query) => {
                const match = augmentedMatchers[query.matchRule];
                return result && match && match(query.value, req.query[query.name]);
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

            if (matchedCombination.response.fileContent) {
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
        } else {
            res.set("text/plain");
            res.status(404).send("No combination found").end();
        }
    });
}
