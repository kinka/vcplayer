// import {Player, browser, util} from './src/player'
var Player = vcp.Player, browser = vcp.browser, util = vcp.util;
// import './src/css/vcplayer.css';

var $ = function(selector) {return document.querySelector(selector)};
var $$ = function(selector) {return document.querySelectorAll(selector)};

var app = $('#app');
var log = $('#logging');
var domLive = $('#is_live'),
	domDebug = $('#is_debug'),
	domFlash = $('#use_flash'),
	domControls = $('#use_controls'),
	domAutoplay = $('#is_autoplay'),
	domSrc = $('#play_src'),
	domPoster = $('#poster_src');
var btnLoad = $('#btn_load');

domSrc.value = 'http://2527.vod.myqcloud.com/2527_bffd50081d9911e6b0f4d93c5d81f265.f20.mp4';
domSrc.value = 'http://2527.vod.myqcloud.com/2527_542d5a28222411e6aadec1104f4fc9b9.f220.av.m3u8';
domPoster.value = 'http://www.imagesbuddy.com/images/130/2014/01/whatever-garfield-face-graphic.jpg';

restore();

window.xxlog = window.xxlog || console.log;
console.log = function(a,b,c,d,e,f) {
	try {if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('INFO:') > -1) return;} catch (e) {}
	if (browser.IS_IE8 || browser.IS_IE9)
		window.xxlog(a || '',b || '',c||'',d||'',e||'',f||'');
	else
		xxlog.apply(this, arguments);
};
newPlayer('demo_video');
// newPlayer('demo_video2')
function newPlayer(ownerId) {
	save();

	$('#' + ownerId).innerHTML = '';
	return new Player({
		owner: ownerId,
		autoplay: domAutoplay.checked,
		// width: 800,
		// height: 400,
		controls: domControls.checked,
		volume: 0.2,
		debug: domDebug.checked,
		// src: 'http://2527.vod.myqcloud.com/2527_bffd50081d9911e6b0f4d93c5d81f265.f20.mp4',
		// src: 'http://2527.vod.myqcloud.com/2527_1bf8b2da449211e595f01db4637252be.f20.mp4',
		// src: 'http://184.72.239.149/vod/smil:BigBuckBunny.smil/playlist.m3u8',
		// src: 'http://2527.vod.myqcloud.com/2527_542d5a28222411e6aadec1104f4fc9b9.f220.av.m3u8',
		// src: 'http://2000.liveplay.myqcloud.com/live/2000_f3d7cff5e69511e5b91fa4dcbef5e35a.flv', // live
		// src: 'http://2000.liveplay.myqcloud.com/2000_f3d7cff5e69511e5b91fa4dcbef5e35a_550.m3u8', // live
		src: domSrc.value,
		live: domLive.checked,
		flash: domFlash.checked,
		// poster: domPoster.value,
		poster: {
			src: domPoster.value
			// src: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-garfield-face-graphic.jpg',
			// start: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-im-late-anyway-clock-graphic.jpg',
			// pause: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-garfield-face-graphic.jpg',
			// end: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-girl-graphic.jpg',
			// style: 'stretch'
		},
		listener: function(msg) {
			if (msg.type == 'timeupdate' || msg.type === 'printLog') return;
			console.log(msg.ts, 'g' + this.guid, msg.type, msg.detail)
			log.innerHTML += Number(msg.ts/1000).toFixed(0) + ': p' + this.guid + ' <span class="em">[' + msg.type + ']</span>'
				+ (msg.detail ? JSON.stringify(msg.detail) : '')+ '<br/><br/>';
			log.scrollTop = log.scrollHeight;
		}
	});
}

function save() {
	util.store('live', domLive.checked);
	util.store('debug', domDebug.checked);
	util.store('controls', domControls.checked);
	util.store('flash', domFlash.checked);
	util.store('autoplay', domAutoplay.checked);
}
function restore() {
	domLive.checked = util.store('live');
	domDebug.checked = util.store('debug');
	domControls.checked = util.store('controls');
	domFlash.checked = util.store('flash');
	domAutoplay.checked = util.store('autoplay');
}

btnLoad.onclick = function() {
	window.player = newPlayer('demo_video');
}

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