module.exports = function (api) {
    api.cache(true);

    const presets = [
        [
            "@babel/preset-env",
            {
                targets: {
                    node: "10"
                }
            }
        ],
        "@babel/preset-typescript"
    ];
    const plugins = [
        "@babel/plugin-transform-async-to-generator"
    ];

    return {
        presets,
        plugins
    };
};