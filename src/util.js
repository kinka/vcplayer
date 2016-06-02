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

// https://gist.github.com/edoardocavazza/47246856759f2273e48b
(function () {
	if (typeof Object.setPrototypeOf === 'undefined' && typeof Object.getOwnPropertyNames === 'function') {
		var _exclude = ['length', 'name', 'arguments', 'caller', 'prototype'];

		function bindFunction(ctx, fn) {
			return function() {
				return fn.apply(this, arguments);
			}
		}

		function bindProperty(ctx, prop, parentDescriptor) {
			if (!parentDescriptor) {
				var defaultValue = ctx.__proto__[prop];
				parentDescriptor = {
					get: function () {
						return ctx['__' + prop] || defaultValue
					},
					set: function (val) {
						ctx['__' + prop] = val;
					}
				}
			}
			Object.defineProperty(ctx, prop, {
				get: parentDescriptor.get ? parentDescriptor.get.bind(ctx) : undefined,
				set: parentDescriptor.set ? parentDescriptor.set.bind(ctx) : undefined,
				configurable: true
			});

		}

		function iterateProps(subClass, superClass) {
			var props = Object.getOwnPropertyNames(superClass),
				proto;

			subClass.__proto__ = superClass;
			for (var i = 0, len = props.length; i < len; i++) {
				var prop = props[i];
				if (prop === '__proto__') {
					proto = superClass[prop];
				} else if (_exclude.indexOf(i) === -1) {
					var descriptor = Object.getOwnPropertyDescriptor(subClass, prop);
					if (!descriptor) {
						var superDescriptor = Object.getOwnPropertyDescriptor(superClass, prop);
						if (typeof superDescriptor.get !== 'function' && typeof superClass[prop] === 'function') {
							subClass[prop] = bindFunction(subClass, superClass[prop]);
						} else if (typeof superDescriptor.get == 'function') {
							bindProperty(subClass, prop, superDescriptor);
						} else {
							bindProperty(subClass, prop);
						}
					}
				}
			}
			if (proto) {
				iterateProps(subClass, proto);
			}
		}

		Object.setPrototypeOf = iterateProps;
	}
})();
