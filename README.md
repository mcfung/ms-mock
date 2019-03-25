[![CircleCI](https://circleci.com/gh/mcfung/ms-mock.svg?style=svg)](https://circleci.com/gh/mcfung/ms-mock)

# ms-mock

_ms-mock_ is a mock server for development purpose.
It divides into two packages - _ms-mock-core_ and _ms-mock-cli_. 
_ms-mock-core_ provides programming interface which accept a config object and create a server which serve request based on the config object.
_ms-mock-cli_ provides a CLI such that developer can simply start up a mock server using commandline.

# Motivation
During the development of microservices, often there is a case that access to a particular REST API that you depends on is not available in development/test environment.
In this case you might want to mock up the remote API call to facilitate the development.
In some situation you might just want to proxy the API call to get rid of the CORS problem in your SPA or just serve some static files from another path in file system.
Therefore this module is created to serve these purposes.

# Documentation

* [Documentation of the CLI](./packages/ms-mock-cli/README.md)
* [Documentation of the ms-mock-core](./packages/ms-mock-core/README.md)