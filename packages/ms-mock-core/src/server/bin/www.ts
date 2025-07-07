/**
 * Module dependencies.
 */

import ServerLoggingStream from "../../common/ServerLoggingStream";
import buildApp from "../app";
import Debug from 'debug';
import http from 'http';
import { Server } from 'http';

const debug = Debug('ms-mock-core:www');

interface StartServerOptions {
    port: number | string;
    config: any[];
    fs?: any;
    configBasePath: string;
    onServerStart?: (server: Server) => void;
    plugins?: any[];
}

interface ServerWithLogStream extends Server {
    logStream: ServerLoggingStream;
}

export function startServer({port, config, fs, configBasePath, onServerStart, plugins}: StartServerOptions): ServerWithLogStream {

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val: string | number): number | string | false {
        const port = parseInt(val as string, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error: any): void {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Get port from environment and store in Express.
     */

    const logStream = new ServerLoggingStream();

    const app = buildApp(config, logStream, fs, configBasePath, plugins);

    app.set('port', normalizePort(port));

    /**
     * Create HTTP server.
     */
    const server = http.createServer(app) as ServerWithLogStream;
    server.on('error', onError);
    server.on('listening', function () {
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + (addr && addr.port ? addr.port : 'unknown');
        debug('Listening on ' + bind);
    });

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.logStream = logStream;
    server.listen(port, () => {
        if (typeof onServerStart === 'function') {
            onServerStart(server)
        }
    });
    return server;
}

export function stopServer(s: ServerWithLogStream, cb?: () => void): void {
    s.logStream.destroy();
    s.close(cb);
}

export default {
    startServer,
    stopServer
}