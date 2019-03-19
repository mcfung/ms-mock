# Installation

```bash
npm install -g ms-mock-cli
```

OR 

```bash
yarn global add ms-mock-cli
```

# Usage

```bash
ms-mock -f <path-to-your-config>.json
```

# Configuration
Please refer to `ServerOption` in ms-mock-core [README](https://github.com/mcfung/ms-mock/tree/master/packages/ms-mock-core)

# Sample Config JSON

```json
{
  "port": 5020,
  "config": [
    {
      "type": "static",
      "path": "/absolute/path/to/directory"
    },
    {
      "type": "static",
      "path": "./relative/path/to/directory"
    },
    {
      "type": "proxy",
      "path": "/proxied-path",
      "host": "https://www.example.com"
    },
    {
      "type": "combinations",
      "path": "/file/relative",
      "method": "get",
      "combinations": [
        {
          "response": {
            "headers": [
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ],
            "fileContent": true,
            "filePath": "./relative/path/to/file.json",
            "statusCode": 200
          }
        }
      ]
    },
    {
      "type": "combinations",
      "path": "/file/absolute",
      "method": "get",
      "combinations": [
        {
          "response": {
            "headers": [
              {
                "name": "Content-Type",
                "value": "text/plain"
              }
            ],
            "fileContent": true,
            "filePath": "/absolute/path/to/file.txt",
            "statusCode": 200
          }
        }
      ]
    },
    {
      "type": "combinations",
      "path": "/api/path/1",
      "method": "options",
      "combinations": [
        {
          "cors": true,
          "response": {
            "headers": [
              {
                "name": "access-control-allow-credentials",
                "value": "true"
              },
              {
                "name": "access-control-allow-headers",
                "value": "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization"
              },
              {
                "name": "access-control-allow-methods",
                "value": "DELETE, GET, POST, OPTIONS"
              },
              {
                "name": "access-control-allow-origin",
                "value": "https://sourcing-dev.hktdc.com:3000"
              }
            ],
            "statusCode": 204
          }
        }
      ]
    },
    {
      "type": "combinations",
      "path": "/api/path/1",
      "method": "get",
      "combinations": [
        {
          "cors": true,
          "query": [
                    {
                        "name": "param1",
                        "matchRule": "exact",
                        "value": "value1"
                    }
                ],
          "response": {
            "headers": [
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ],
            "content": {
              "message": "Success with value1"
            },
            "statusCode": 200
          }
        },
        {
          "cors": true,
          "response": {
            "headers": [
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ],
            "content": {
              "message": "Success"
            },
            "statusCode": 200
          }
        }
      ]
    }
  ]
}
```