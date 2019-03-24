import {startServer} from "ms-mock-core";
import fs from 'fs';
import path from 'path';
import pkg from './package.json'
import commander from "commander";

commander.version(pkg.version)
    .option("-f, --file <file>", "Input JSON file")
    .parse(process.argv);

if (commander.file) {
    try {
        let server = JSON.parse(fs.readFileSync(commander.file));
        startServer({
            port: server.port,
            config: server.config,
            configBasePath: path.dirname(fs.realpathSync(commander.file)),
            onServerStart: () => {
                console.log(`Listening to ${server.port}...`);
            }
        });
    } catch (e) {
        console.error(e);
    }
} else {
    commander.help();
}