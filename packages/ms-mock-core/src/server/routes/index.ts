import _ from 'lodash';
import fs from "fs";
import path from "path";
import { Application, Request, Response, NextFunction } from "express";
import Debug from "debug";

const debug = Debug("ms-mock-core:route");

interface Header {
    name: string;
    value: string;
    matchRule: string;
}

interface Query {
    name: string;
    value: string;
    matchRule: string;
}

interface ResponseConfig {
    statusCode: number;
    content?: any;
    fileContent?: boolean;
    filePath?: string;
    headers?: Array<{ name: string; value: string }>;
    delay?: number;
}

interface Combination {
    headers: Header[];
    query: Query[];
    response: ResponseConfig;
    cors?: boolean;
}

interface RouteDescriptor {
    method: string;
    path: string;
    combinations: Combination[];
}

export function addRoute(descriptor: RouteDescriptor, app: Application, customFs: any, basePath: string): void {

    const matchers = app.locals.matchers;

    app[descriptor.method as keyof Application](descriptor.path, (req: Request, res: Response, next: NextFunction) => {

        const matchedCombination = _.find(descriptor.combinations, (criteria: Combination) => {

            const headers = criteria.headers;
            let headerCheck = _.reduce(headers, (result: boolean, header: Header) => {
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
            let queryCheck = _.reduce(queries, (result: boolean, query: Query) => {
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

            _.forEach(matchedCombination.response.headers, (header: { name: string; value: string }) => {
                res.set(header.name, header.value);
            });

            const delay = matchedCombination.response.delay || 0;
            setTimeout(() => {
                if (matchedCombination.response.fileContent) {
                    debug("sending file content");
                    try {

                        const finalFs = customFs || fs;
                        let file = path.isAbsolute(matchedCombination.response.filePath!)
                            ? finalFs.readFileSync(matchedCombination.response.filePath!)
                            : finalFs.readFileSync(path.join(basePath, matchedCombination.response.filePath!));
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
