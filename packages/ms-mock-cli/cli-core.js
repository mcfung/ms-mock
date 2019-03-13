import {startServer} from "ms-mock-core";
import fs from 'fs';
import path from 'path';

const ArgumentParser = require('argparse').ArgumentParser;
const parser = new ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'CLI for ms-mock server'
});

parser.addArgument(
    ['-f', '--file'],
    {
        help: 'Input JSON file',
        required: true
    }
);


const args = parser.parseArgs();

try {
    let server = JSON.parse(fs.readFileSync(args.file));
    startServer({
        port: server.port,
        config: server.config,
        configBasePath: path.dirname(fs.realpathSync(args.file)),
        onServerStart: () => {
            console.log(`Listening to ${server.port}...`);
        }
    });
} catch (e) {
    console.error(e);
}