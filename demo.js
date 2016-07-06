import {Player, browser, util} from './src/player'
// var Player = vcp.Player, browser = vcp.browser, util = vcp.util;
import './src/css/vcplayer.css';

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
	domMp4 = $('#play_mp4'),
	domM3u8 = $('#play_m3u8'),
	domRtmp = $('#play_rtmp'),
	domFlv = $('#play_flv'),
	domCheckPoster = $('#c_poster'),
	domPoster = $('#poster_src');
var btnLoad = $('#btn_load');

domMp4.value = 'http://2527.vod.myqcloud.com/2527_bffd50081d9911e6b0f4d93c5d81f265.f20.mp4';
domM3u8.value = 'http://2527.vod.myqcloud.com/2527_542d5a28222411e6aadec1104f4fc9b9.f220.av.m3u8';
domFlv.value = 'http://2000.liveplay.myqcloud.com/live/2000_f3d7cff5e69511e5b91fa4dcbef5e35a.flv';
domRtmp.value = 'rtmp://2000.liveplay.myqcloud.com/live/2000_f3d7cff5e69511e5b91fa4dcbef5e35a_550';

domPoster.value = 'http://www.imagesbuddy.com/images/130/2014/01/whatever-garfield-face-graphic.jpg';

restore();

var radios = $$('[name=play_group');
for (var i=0; i<radios.length; i++) {
	radios[i].onclick = function() {
		if (this.checked) {
			domSrc.value = this.nextSibling.nextSibling.value;
			util.store('playtype', this.id);
		}
	}
	if (radios[i].checked) domSrc.value = radios[i].nextSibling.nextSibling.value;
}
domSrc.value = 'http://119.147.83.14:1863/106316801.flv?cdncode=%2f18907E7BE0798990%2f&time=1467682811&cdn=zijian&sdtfrom=v60221&platform=70202&butype=6&scheduleflag=1&buname=qqlive&vkey=D3F87AFF2F1C54C4E32D5AA9F2B2C629F7599B62FC00DC83F4FD0D3DDE1D47A868CF6056E369B1B915A438ED37AE6FB25DF51A812FC666D214339C375BFDB7F3E82CF9D21BDC7B9B8C2B047F276697DAB92A98A257F33285&guid=69B29EB621DD50CF0D361A11B62E6D121D6150DB&refer=http%3A%2F%2Fdaxue.qq.com%2Fcontent%2Fplugin_online%2Fid%2F2558%2Ffrom%2Ftqbs%3Fwidth%3D850%26height%3D582&apptype=live';
window.xxlog = window.xxlog || console.log;
console.log = function(a,b,c,d,e,f) {
	try {if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('INFO:') > -1) return;} catch (e) {}
	if (browser.IS_IE8 || browser.IS_IE9)
		window.xxlog(a || '',b || '',c||'',d||'',e||'',f||'');
	else
		xxlog.apply(this, arguments);
};
window.player = newPlayer('demo_video');
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
		volume: 0.8,
		debug: domDebug.checked,
		src: domSrc.value,
		live: domLive.checked,
		flash: domFlash.checked,
		// poster: domPoster.value,
		poster: {
			src: domCheckPoster.checked ? domPoster.value : ''
			// src: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-garfield-face-graphic.jpg',
			// start: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-im-late-anyway-clock-graphic.jpg',
			// pause: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-garfield-face-graphic.jpg',
			// end: 'http://www.imagesbuddy.com/images/130/2014/01/whatever-girl-graphic.jpg',
			// style: 'stretch'
		},
		listener: function(msg) {
			if (msg.type == 'timeupdate' || msg.type === 'printLog' || msg.type == 'mediaTime') return;
			console.log(msg.ts, 'g' + this.guid, msg.type, msg.detail)
			log.innerHTML += Number(msg.ts/1000).toFixed(0) + ': p' + this.guid + ' <span class="em">[' + msg.type + ']</span>'
				+ (msg.detail ? JSON.stringify(msg.detail) : '')+ '<br/><br/>';
			log.scrollTop = log.scrollHeight;
			switch (msg.type) {
				case 'resize':
					this.size(this.options.width, this.options.height);
					break;
				case 'error':
					// alert(msg.detail.code + ', ' + msg.detail.reason)
					break;
			}
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
	var id = util.store('playtype');
	if (id) {
		$('#' + id).checked = true;
	}
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