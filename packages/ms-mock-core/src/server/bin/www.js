/**
 * Module dependencies.
 */

import ServerLoggingStream from "../../common/ServerLoggingStream";

const buildApp = require('../app');
const debug = require('debug')('mock-server:server');
const http = require('http');


export function startServer({port, config, fs, configBasePath, onServerStart}) {

    /**
     * Get port from environment and store in Express.
     */

    const logStream = new ServerLoggingStream();

    const app = buildApp(config, logStream, fs, configBasePath);

    app.set('port', normalizePort(port));

    /**
     * Create HTTP server.
     */
    const server = http.createServer(app);
    server.on('error', onError);
    server.on('listening', function () {
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    });

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.logStream = logStream;
    server.listen(port, () => {
        if (typeof onServerStart === 'function'){
            onServerStart(server)
        }
    });
    return server;
}

export function stopServer(s, cb) {
    s.logStream.destroy();
    s.close(cb);
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

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

function onError(error) {
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

export default {
    startServer,
    stopServer
}