/**
 * todo
 * 1. 提取CSS
 */
var fs = require('fs'),
	path = require('path');

var SrcPath = './src/',
	DstPath = './dist/',
	CDNPath = '//imgcache.qq.com/open/qcloud/video/vcplayer/';

console.log('copy demo.html');
var demoHtml = fs.readFileSync(SrcPath + '../demo.html').toString();
fs.writeFileSync(DstPath + 'demo.html', demoHtml.replace(new RegExp('/dist/', 'g'), CDNPath));
console.log('copy done');

console.log('copy libs');
var srcLibs = SrcPath + 'libs/',
	dstLibs = DstPath + 'libs/';
var libFiles = fs.readdirSync(srcLibs);
if (!fs.existsSync(dstLibs))
	fs.mkdirSync(dstLibs);
libFiles.forEach(function(file) {
	console.log(file)
	copy(srcLibs + file, dstLibs + file);
});
console.log('copy done');

console.log('copy img');
var srcImg = SrcPath + 'img/',
	dstImg = DstPath + 'img/';
var imgFiles = fs.readdirSync(srcImg);
if (!fs.existsSync(srcImg))
	fs.mkdirSync(dstImg);
imgFiles.forEach(function(file) {
	if (file.indexOf('.bat') > -1) return;

	console.log(file)
	copy(srcImg + file, dstImg + file);
});
console.log('copy done');

console.log('copy css');
// not yet
console.log('copy done');

function copy(src, dst) {
	fs.writeFileSync(dst, fs.readFileSync(src));
}
