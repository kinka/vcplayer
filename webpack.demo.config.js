var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './demo.js',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'demo.js',
        publicPath: '/dist/'
    },
	// devtool: "source-map",
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
	                presets: ['es2015'],
		            plugins: [['transform-es2015-classes', {loose: true}]] // for IE<=9
	            }
	        }
        ]
    }
}
