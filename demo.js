import {Player, browser} from './src/player'
// var Player = vcp.Player, browser = vcp.browser;
import './src/css/vcplayer.css';

window.xxlog = window.xxlog || console.log;
console.log = function(a,b,c,d,e,f) {
	try {if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('INFO:') > -1) return;} catch (e) {}
	if (browser.IS_IE8 || browser.IS_IE9)
		window.xxlog(a || '',b || '',c||'',d||'',e||'',f||'');
	else
		xxlog.apply(this, arguments);
};

var $ = function(selector) {return document.querySelector(selector)};
var app = $('#app');

window.player = new Player({
	owner: 'demo_video',
	autoplay: false,
	// width: 800,
	// height: 400,
	controls: null,
	volume: 0.2,
	src: 'http://2527.vod.myqcloud.com/2527_bffd50081d9911e6b0f4d93c5d81f265.f20.mp4',
	// src: 'http://2527.vod.myqcloud.com/2527_1bf8b2da449211e595f01db4637252be.f20.mp4',
	// src: 'http://184.72.239.149/vod/smil:BigBuckBunny.smil/playlist.m3u8',
	// src: 'http://2527.vod.myqcloud.com/2527_542d5a28222411e6aadec1104f4fc9b9.f220.av.m3u8',
	// src: 'http://2000.liveplay.myqcloud.com/live/2000_f3d7cff5e69511e5b91fa4dcbef5e35a.flv', // live
	// src: 'http://2000.liveplay.myqcloud.com/2000_f3d7cff5e69511e5b91fa4dcbef5e35a_550.m3u8', // live
	// isLive: true,
	poster: 'https://s3.amazonaws.com/github/ribbons/forkme_left_orange_ff7600.png',
	poster: {
		src: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-garfield-face-graphic.jpg',
		// start: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-im-late-anyway-clock-graphic.jpg',
		// pause: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-garfield-face-graphic.jpg',
		// end: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-girl-graphic.jpg',
		// style: 'stretch'
	},
	listener: function(msg) {
		if (msg.type == 'timeupdate' || msg.type == 'progress' || msg.type === 'printLog') return;
		console.log(msg.ts, 'g1 ', msg.type, msg.detail)
	}
});

/*window.player2 = new Player({
	owner: 'demo_video2',
	autoplay: false,
	width: 300,
	height: 400,
	src: 'http://2527.vod.myqcloud.com/2527_bffd50081d9911e6b0f4d93c5d81f265.f20.mp4',
	// src: 'http://2527.vod.myqcloud.com/2527_542d5a28222411e6aadec1104f4fc9b9.f220.av.m3u8',
	poster: 'https://s3.amazonaws.com/github/ribbons/forkme_left_orange_ff7600.png',
	listener: function(msg) {
		if (msg.type == 'timeupdate' || msg.type == 'progress' || msg.type === 'printLog') return;
		console.log(msg.ts, 'g2 ', msg.type, msg.detail)
	}
});*/

// setTimeout(function() {player.destroy()}, 1000)