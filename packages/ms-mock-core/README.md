# Installation
```bash
npm install --save-dev ms-mock-core
```

OR

```bash
yarn add ms-mock-core --dev
```

# Usage

## ES6 (with babel)
```javascript
import {startServer, stopServer} from "ms-mock-core";

const server = startServer({
        port: 5020,
        config: {
            path: "./public",
            static: true
        },
        configBasePath: __dirname,
        onServerStart: () => {
            console.log(`Listening to 5020...`);
            // server object can then be stopped
            stopServer(server, () => {
                console.log(`Server stopped`);
            });
        }
    });
```

## Older style
```javascript
let startServer = require('ms-mock-core').startServer;
let stopServer = require('ms-mock-core').stopServer;

const server = startServer({
    port: 5020,
    config: {
        path: "./public",
        static: true
    },
    configBasePath: __dirname,
    onServerStart: () => {
        console.log(`Listening to 5020...`);
        // server object can then be stopped
        stopServer(server, () => {
            console.log(`Server stopped`);
        });
    }
});
```

## API

### startServer(opts: ServerOption): AugmentedServer
This method will return an `Server` object created by node http module.
The `Server` object would be augmented as documented as below.
After this method is executed, an ExpressJS server will be started.

#### AugmentedServer

##### logStream: ReadableStream
This is a node.js readable stream which will stream the request access log.

#### ServerOption

##### port: number
The port number of the mock server

##### config: Array\<RouteConfig\>
A list of config objects of the mock server. This config objects describe what request should be served and what should be responded.
Currently the config object can define 3 types of request:

1. static files
2. proxied request
3. self defined combinations of HTTP method, query string, HTTP Headers and request body.

##### fs: ?FileSystem
Custom implementation of fs module. If not provided the mock server will simply use Node.js fs module.

##### configBasePath: string
The absolute path to the config file. It is used to compute the file path which is indicated as relative path in the `config` object.

##### onServerStart: ?(server: Server) => void
The callback to be triggered upon the server start and listening to the port.

#### RouteConfig

##### type: 'static' | 'proxy' | 'combination'
* `static` means it will serve the files specified in `path` statically.
* `proxy` means it will proxy the request to `host` attributes.
* `combination` means it will serve HTTP request based on the defined combinations of HTTP method, query string, HTTP Headers and request body

##### path: string
Based on which type of the config is, the `path` attribute has different meanings.
If it is a `static` config, then the path indicates the path to the directory to be served statically. If a relative path is used, the path will be relative to the `configBasePath`.
If it is `proxy` or `combination` config, the path indicates the path served by the mock server.

##### host: ?string
Used by `proxy` config only. The request received by the mock server will be proxied to the host. The proxy function is powered by [express-http-proxy](https://github.com/villadora/express-http-proxy/issues)

##### method: ?string
Used by `combination` config. 
This method will be passed to express route. From ExpressJS, it should be one of the HTTP methods, such as GET, PUT, POST, and so on, in lowercase.

##### combinations: ?Array\<RequestCombinationCriteria\>
A list of combination criteria for this path.

#### RequestCombinationCriteria
It consists of multiple checks:
* headers checks
* queries checks

If all of the checks passed, the mock server will return the response specified in the `response` attribute of this combination.

##### cors: ?boolean
If this is true, the following CORS Header will be added to the response for this combination.

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: *
```

##### headers: ?Array\<RequestMatchObject\>
The query parameters of the request.
If a request to mock matches all of the query parameters specified in this list, then it is considered as passed.

##### query: ?Array\<RequestMatchObject\>
The query parameters of the request.
If a request to mock matches all of the query parameters specified in this list, then it is considered as passed.

##### response: MockResponseDescriptor
The response descriptor object. If both the headers checks and queries checks passed, then this descriptor will be used to generate the corresponding response. 

#### RequestMatchObject

##### name: string
The name of the parameter. i.e. Header name or query parameter name.

##### matchRule: 'exact'
Indicates the matchRule of this parameter. 
The following matchRule are supported:
* exact - If the provided value and the request value are the same (compared by `===`), then it is matched.
* exists - If request value is non-empty string (checked by `!!`), then it is matched.
* regex - Given an regular expression as string, test the request value by the regex, it is matched if it returns true.

##### value: string
The expected value of this parameter.

#### MockResponseDescriptor

##### headers: ?Array\<NVP\>
A list of headers to be returned in this response.

##### fileContent: ?boolean
An indicator to indicate if a file should be served.

##### filePath: ?string
The path to the file to be served. 
If a relative path is provided, then it will be resolved relatively to the `configBasePath`.

##### statusCode: number
The HTTP statusCode to be sent in the response.

##### content: ?any
Used when `fileContent` is false. The content to be sent in this response.
At the moment only string and json is tested.

#### NVP
This represents a Name-Value Pair Object.

##### name: string
The name of the object.

##### value: string | number
The value of the object.

### stopServer(s: Server, cb: Function)
This method will shutdown the server `s`. 
After it is shut down, cb will be called.


