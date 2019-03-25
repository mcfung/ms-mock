module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                targets: {
                    node: 'current',
                },
            }
        ],
        [
            "@babel/preset-flow",
            {
                targets: {
                    node: 'current',
                },
            }
        ]
    ],
    "plugins": [
        [
            "@babel/plugin-transform-async-to-generator",
            {
                targets: {
                    node: 'current',
                },
            }
        ]
    ]
};