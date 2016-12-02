var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './src/TcPlayer.js',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'TcPlayer.js',
        publicPath: '//imgcache.qq.com/open/qcloud/video/vcplayer/',
	    libraryTarget: "umd"
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'es3ify' //  主要是为了支持IE<=8
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015-loose'] // 更贴近ES5，可兼容更多浏览器，比如说IE9
                }
            }
        ]
    }
}
