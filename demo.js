/*var v = document.getElementById('vvv');
var events = [
	'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error', 'loadedmetadata',, 'loadeddata',
	'loadstart', 'pause', 'play', 'playing', 'progress', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate',
	'volumechange', 'waiting'
];
v.loop = false;
v.autoplay = false;
console.log(events.length)
for (var i = 0; i<events.length; i++) {
	v.addEventListener(events[i], function(e) {
		if (v.buffered.length == 0) return;
		console.log(e.type, v.currentTime, v.buffered.end(0), v.duration)
	});
}

v.src = "http://2527.vod.myqcloud.com/2527_56c5226c165c11e697add7d1c60ca413.f20.mp4";*/
import {Player} from './src/Player'
import * as dom from './src/dom'
window.ppp = new Player({
	owner: 'demo_video',
	autoplay: true,
	src: 'http://2527.vod.myqcloud.com/2527_bffd50081d9911e6b0f4d93c5d81f265.f20.mp4',
	poster: 'https://s3.amazonaws.com/github/ribbons/forkme_left_orange_ff7600.png',
	listen: function(msg) {
		if (msg.type == 'progress') return;
		console.log('global', msg);
	}
});
window.dom = dom;
// setTimeout(function() {ppp.destroy()}, 1000)
console.log('weird?ok')