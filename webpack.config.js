var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './src/Player.js',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'player.js',
        publicPath: '/dist/',
	    library: "vcp",
	    libraryTarget: "umd"
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
