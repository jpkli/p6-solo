const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
var nodeExternals = require('webpack-node-externals');

const webConfig = {
    entry: {
        "p3": "./build/core.js",
        "p3-vis": "./build/vis.js"    
    },
    target: 'web',
    mode: 'production',
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].js"
    },
    plugins: [
        new UglifyJsPlugin({
            include: /\.min\.js$/,
            sourceMap: true
        })
    ]
}

const nodeConfig = {
    entry: {
        "p3": "./build/lib.js",
    },
    target: 'node',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].node.js",
        libraryTarget: 'commonjs',
    },
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder,


}

module.exports = [ webConfig, nodeConfig ];

