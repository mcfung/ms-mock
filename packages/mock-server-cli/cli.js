#!/usr/bin/env node
require('@babel/register')({

    ignore: [ /(node_modules)/ ],
    presets: ['@babel/preset-env', '@babel/preset-flow']
});

require('./cli-core');