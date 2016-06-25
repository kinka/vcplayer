import * as dom from './dom'
import * as message from './message'
import {MSG as PlayerMSG} from './message'

var __guid = 1;
export function guid() {
	return __guid++;
}

export function bind(context, fn, uid) {
	if (!fn.guid) fn.guid = guid();

	var ret = function() {fn.apply(context, arguments)};
	// 多实例会共享同一个原型方法，于是乎guid也会一样，所以再加个uid主动做区分
	ret.guid = uid ? uid + '_' + fn.guid : fn.guid;
	return ret;
}

export function isEmpty(obj) {
	if (obj instanceof Array) return obj.length === 0;

	for (let p in obj)
		if (obj.hasOwnProperty(p)) return false;

	return true;
}

export function covertTime(s) {
	s = s | 0;
	var h = 3600, m = 60;
	var hours = (s / h) | 0;
	var minutes = ( s - hours * h ) / m | 0; // 有个向下取整的效果
	var sec = s - hours * h - minutes * m;

	hours = hours > 0 ? (hours + ':') : '';
	minutes = minutes > 0 ? (minutes + ':') : (hours > 0 ? '00:' : '');
	sec = sec > 0 ? (sec + '') : '00';

	hours = hours.length == 2 ? ('0' + hours) : hours;
	minutes = minutes.length == 2 ? ('0' + minutes) : minutes;
	sec = sec.length == 1 ? ('0' + sec) : sec;

	return hours + minutes + sec
}

export let FullscreenApi = { // 这么写只是为了IDE能检测到这些属性
	'requestFullscreen': null,
	'exitFullscreen': null,
	'fullscreenElement': null,
	'fullscreenEnabled': null,
	'fullscreenchange': null,
	'fullscreenerror': null
};

// browser API methods
// map approach from Screenful.js - https://github.com/sindresorhus/screenfull.js
const apiMap = [
	// Spec: https://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html
	[
		'requestFullscreen',
		'exitFullscreen',
		'fullscreenElement',
		'fullscreenEnabled',
		'fullscreenchange',
		'fullscreenerror'
	],
	// WebKit
	[
		'webkitRequestFullscreen',
		'webkitExitFullscreen',
		'webkitFullscreenElement',
		'webkitFullscreenEnabled',
		'webkitfullscreenchange',
		'webkitfullscreenerror'
	],
	// Old WebKit (Safari 5.1)
	[
		'webkitRequestFullScreen',
		'webkitCancelFullScreen',
		'webkitCurrentFullScreenElement',
		'webkitCancelFullScreen',
		'webkitfullscreenchange',
		'webkitfullscreenerror'
	],
	// Mozilla
	[
		'mozRequestFullScreen',
		'mozCancelFullScreen',
		'mozFullScreenElement',
		'mozFullScreenEnabled',
		'mozfullscreenchange',
		'mozfullscreenerror'
	],
	// Microsoft
	[
		'msRequestFullscreen',
		'msExitFullscreen',
		'msFullscreenElement',
		'msFullscreenEnabled',
		'MSFullscreenChange',
		'MSFullscreenError'
	]
];

let specApi = apiMap[0];
let browserApi;

// determine the supported set of functions
for (let i = 0; i < apiMap.length; i++) {
	// check for exitFullscreen function
	if (apiMap[i][1] in document) {
		browserApi = apiMap[i];
		break;
	}
}

// map the browser API names to the spec API names
if (browserApi) {
	for (let i=0; i<browserApi.length; i++) {
		FullscreenApi[specApi[i]] = browserApi[i];
	}
}
function documentFullscreenChange(e) {
	doFullscreen.__isFullscreen = !!(document[FullscreenApi.fullscreenElement]); // 取消全屏的时候返回的是null, 由此可判断全屏状态

	if (!doFullscreen.__isFullscreen) {
		dom.off(document, FullscreenApi.fullscreenchange, documentFullscreenChange);
	}
	message.pub({type: PlayerMSG.FullScreen, src: 'util', ts: e.timestamp, detail: {isFullscreen: doFullscreen.__isFullscreen}}, doFullscreen.player);
}
function onKeydown(event) {
	if (event.keyCode === 27)
		doFullscreen(doFullscreen.player, false);
}
export function doFullscreen(player, enter, owner) {
	if (typeof enter === 'undefined') return doFullscreen.__isFullscreen || false;

	doFullscreen.player = player;
	if (FullscreenApi.requestFullscreen) {
		if (enter) {
			dom.on(document, FullscreenApi.fullscreenchange, documentFullscreenChange);
			owner && owner[FullscreenApi.requestFullscreen]();
		} else {
			document[FullscreenApi.exitFullscreen]();
		}
	} else { // 伪全屏,可以引导再按个F11
		doFullscreen.__isFullscreen = enter;

		if (doFullscreen.__isFullscreen) {
			doFullscreen.__origOverflow = document.documentElement.style.overflow;
			document.documentElement.style.overflow = 'hidden'; // hide any scroll bars
			dom.on(document, 'keydown', onKeydown);
		} else {
			document.documentElement.style.overflow = doFullscreen.__origOverflow;
			dom.off(document, 'keydown', onKeydown);
		}

		dom.toggleClass(document.body, 'vcp-full-window', enter);
		message.pub({type: PlayerMSG.FullScreen, src: 'util', detail: {isFullscreen: doFullscreen.__isFullscreen}}, doFullscreen.player);
	}
}

export function extend(newObj, oldObj) {
	for (var p in oldObj) {
		if (oldObj.hasOwnProperty(p))
			newObj[p] = newObj[p] || oldObj[p];
	}
	return newObj;
}

export function store(key, value) {
	if (typeof value === 'undefined') return JSON.parse(localStorage[key] || 'null');
	localStorage[key] = JSON.stringify(value);
}

export const CDNPath = "//imgcache.qq.com/open/qcloud/video/vcplayer/";