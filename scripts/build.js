const {rollup} = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const rollUpJson = require('rollup-plugin-json');
const fs = require('fs');
const path = require('path');

const corePkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'packages', 'ms-mock-core', 'package.json')));

const externalDeps = Object.keys(
    Object.assign({}, corePkg.dependencies, corePkg.peerDependencies)
);

async function buildCore() {
    const esBundle = await rollup({
        input: "packages/ms-mock-core/main.ts",
        external: externalDeps.concat(['path', 'fs', 'stream', 'http']),
        plugins: [
            resolve({
                extensions: ['.js', '.ts']
            }),
            babel({
                exclude: 'node_modules/**',
                extensions: ['.js', '.ts'],
                "presets": [
                    [
                        "@babel/preset-env",
                        {
                            "modules": false
                        }
                    ],
                    [
                        "@babel/preset-typescript",
                        {
                            "modules": false
                        }
                    ]
                ],
                "plugins": [
                    [
                        "@babel/plugin-transform-async-to-generator",
                        {
                            "modules": false
                        }
                    ]
                ]
            }),
            commonjs()
        ]
    });
    await esBundle.write({
        format: "esm",
        file: "packages/ms-mock-core/index.esm.js"
    });
    await esBundle.write({
        format: "cjs",
        file: "packages/ms-mock-core/index.cjs.js"
    });
}

async function buildCli() {

    const esBundle = await rollup({
        input: "packages/ms-mock-cli/cli-core.ts",
        external: externalDeps.concat(['path', 'fs', 'http', 'stream', 'child_process', 'events', 'util']),
        plugins: [
            resolve({
                extensions: ['.js', '.ts']
            }),
            babel({
                exclude: 'node_modules/**',
                extensions: ['.js', '.ts'],
                "presets": [
                    [
                        "@babel/preset-env",
                        {
                            "modules": false
                        }
                    ],
                    [
                        "@babel/preset-typescript",
                        {
                            "modules": false
                        }
                    ]
                ],
                "plugins": [
                    [
                        "@babel/plugin-transform-async-to-generator",
                        {
                            "modules": false
                        }
                    ]
                ]
            }),
            commonjs(),
            rollUpJson()
        ]
    });
    await esBundle.write({
        format: "cjs",
        file: "packages/ms-mock-cli/cli-core.cjs.js"
    });
}

async function buildEverything() {
    await buildCore();
    await buildCli();
}

buildEverything();