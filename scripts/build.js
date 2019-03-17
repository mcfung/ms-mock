const {rollup} = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const fs = require('fs');
const path = require('path');

const corePkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'packages', 'ms-mock-core', 'package.json')));

const externalDeps = Object.keys(
    Object.assign({}, corePkg.dependencies, corePkg.peerDependencies)
);

async function buildCore() {
    const esBundle = await rollup({
        input: "packages/ms-mock-core/main.js",
        external: externalDeps.concat(['path', 'fs', 'stream', 'http']),
        plugins: [
            babel({
                exclude: 'node_modules/**',
                "presets": [
                    [
                        "@babel/preset-env",
                        {
                            "modules": false
                        }
                    ],
                    [
                        "@babel/preset-flow",
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
            resolve(),
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
        input: "packages/ms-mock-cli/cli-core.js",
        external: externalDeps.concat(['path', 'fs', 'http', 'stream']),
        plugins: [
            babel({
                exclude: 'node_modules/**',
                "presets": [
                    [
                        "@babel/preset-env",
                        {
                            "modules": false
                        }
                    ],
                    [
                        "@babel/preset-flow",
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
            resolve(),
            commonjs()
        ]
    });
    await esBundle.write({
        format: "cjs",
        file: "packages/ms-mock-cli/cli-core.cjs.js"
    });
}

buildCore();
buildCli();