var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './test/test.js',
    output: {
        path: path.join(__dirname, '/test'),
        filename: 'all.js',
        publicPath: '/test/'
    },
	devtool: "source-map",
    module: {
        loaders: [
	        {
		        test: /\.css$/,
		        loader: 'style-loader!css-loader'
	        },
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
