var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './demo.js',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'demo.js',
        publicPath: '/dist/'
    },
    module: {
        loaders: [
        {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
                presets: ['es2015']
            }
        }
        ]
    }
}
