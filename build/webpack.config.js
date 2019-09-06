const path = require('path')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: {
        "p3": "./build/core.js",
        "p3-vis": "./build/vis.js",
        "p3-vis-tests": "./test/vis/test-vis.js"
    },
    target: 'web',
    mode: 'development',
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].js"
    },
    devServer: {
        compress: true,
        publicPath: '/dist/',
        clientLogLevel: "none",
        historyApiFallback: true,
    },
    // plugins: [
    //     new UglifyJsPlugin({
    //         include: /\.min\.js$/,
    //         sourceMap: true
    //     })
    // ]
}
