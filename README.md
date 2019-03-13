# What is ms-mock

_ms-mock_ is a mock server for development purpose.
It divides into two packages - _ms-mock-core_ and _ms-mock-cli_. 
_ms-mock-core_ provides programming interface which accept a config object and create a server which serve request based on the config object.
_ms-mock-cli_ provides a CLI such that developer can simply start up a mock server using commandline.

# Motivation
During the development of microservice, often there is a case that access to a particular REST API is not available in development/test environment.
In this case when you need to mock up the remote API call to facilitate the development.
In some situation you might just want to proxy the API call to get rid of the CORS problem or just serve some static files from another origin.
Therefore this module is created to serve this purpose.

# Documentation

[Documentation of the CLI](./packages/ms-mock-cli/README.md)
[Documentation of the ms-mock-core](./packages/ms-mock-core/README.md)