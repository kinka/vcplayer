import * as util from './util'

var listeners = {};
var fnCache = {};
// todo 1. jsdoc完善 2. 能够指定订阅对象，而不是类型
/**
 * 发布事件
 * {type, src, target, ts}
 * @param msg {Object}
 */
export function pub(msg) {
	doPub(msg.type, msg);
	doPub('*', msg);
}
function doPub(type, msg) {
	if (listeners[type]) {
		let fnObjs = listeners[type];
		for (let guid in fnObjs) {
			if (!fnObjs.hasOwnProperty(guid)) continue;
			let fnObj = fnObjs[guid];
			let fn = fnCache[guid];
			if (fnObj.target == '*' || fnObj.target == msg.target)
				typeof fn === 'function' && fn(msg);
		}
	}
}
/**
 * sub(*, *, cb) 任意类型的任意事件
 * sub(play, *, cb) 任意类型的play事件
 * sub(play, 'video', cb) 只订阅video类型的play事件
 * sub(*, 'video', cb) 接收video类型的任意事件
 * @param type
 * @param target
 * @param cb
 * @returns {*}
 */
export function sub(type, target, cb) {
	// console.log(type, target, cb.guid);
	if (!cb.guid) return console.error('callback function need guid');
	fnCache[cb.guid] = cb;

	listeners[type] = listeners[type] || {};
	listeners[type][cb.guid] = {target: target};

	return cb;
}
// multi target not supported yet, can use [] instead of {} to store targets
export function unsub(type, cb) {
	if (type === '*') {
		delete listeners['*'][cb.guid];

		for (let t in listeners) {
			if (!listeners.hasOwnProperty(t)) continue;
			let fnObjs = listeners[t];
			delete fnObjs[cb.guid];
			if (util.isEmpty(fnObjs))
				delete listeners[t];
		}
		delete fnCache[cb.guid];
	} else {
		delete listeners[type][cb.guid];
	}
	// console.log(listeners)
}