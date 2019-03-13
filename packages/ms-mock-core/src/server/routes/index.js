import _ from 'lodash';
import fs from "fs";

const express = require('express');

function buildRoute(route, customFs) {

    const router = express.Router();

    function addRoute(descriptor, router) {

        router[descriptor.method](descriptor.path, (req, res, next) => {

            const combination = _.find(descriptor.combinations, (criteria) => {

                const headers = criteria.headers;
                let headerCheck = _.reduce(headers, (result, header) => {

                    switch (header.matchRule) {
                        case 'exact':
                            return result && header.value === req.get(header.name);
                        default:
                            return false;
                    }
                }, true);
                const queries = criteria.query;
                let queryCheck = _.reduce(queries, (result, query) => {

                    switch (query.matchRule) {
                        case 'exact':
                            return result && query.value === req.query[query.name];
                        default:
                            return false;
                    }
                }, true);


                return !!(headerCheck && queryCheck);

            });

            if (combination) {

                if (combination.cors) {
                    res.set("Access-Control-Allow-Origin", "*");
                    res.set("Access-Control-Allow-Headers", "*");
                }

                _.forEach(combination.response.headers, (header) => {
                    res.set(header.name, header.value);
                });

                if (combination.response.fileContent) {
                    try {

                        const finalFs = customFs || fs;
                        let file = finalFs.readFileSync(combination.response.filePath);
                        res.status(combination.response.statusCode)
                            .send(file)
                            .end();
                    } catch (e) {
                        console.log(e);
                        res.status(500).end();
                    }
                } else {
                    console.log("sending non-file content");
                    res.status(combination.response.statusCode)
                        .send(combination.response.content)
                        .end();

                }
            } else {
                res.set("text/plain");
                res.status(404).send("No combination found").end();
            }
        });
    }

    _.forEach(route, c => {
        if (c.type === 'combinations') {
            addRoute(c, router);
        }
    });
    return router;
}

export default buildRoute;
