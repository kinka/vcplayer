import * as util from './util'
import Component from './Component'

var listeners = {};
var fnCache = {};

/**
 * 发布事件
 * @param msg {Object}
 * @param msg.type 事件类型，sliderchange, play, stop等
 * @param msg.src 触发事件的对象，直接传源对象，会与sub时填入的target作对比
 * @param msg.ts 触发时间戳
 * @param msg.private 是否私有事件，私有事件会在Player接口对外回调时劫断消息
 */
export function pub(msg) {
	doPub(msg.type, msg);
	doPub('*', msg);
}
function doPub(type, msg) {
	if (!listeners[type]) return;

	let fnObjs = listeners[type];
	for (let guid in fnObjs) {
		if (!fnObjs.hasOwnProperty(guid)) continue;
		let targets = fnObjs[guid];
		let fn = fnCache[guid];
		if (!(typeof fn === 'function')) return false;
		for (let i=0; i<targets.length; i++) {
			let target = targets[i];
			if (target === '*' || target === msg.src)
				fn(msg);
		}
	}
}
/**
 * sub(*, *, cb) 任意来源的任意事件
 * sub('play', *, cb) 任意来源的play事件
 * sub('play', obj, cb) 只订阅指定obj的play事件
 * sub(*, obj, cb) 接收指定obj的任意事件
 * @param type 指定订阅消息类型
 * @param target 指定消息源目标，其实可以为任意对象，只要src能匹配即可
 * @param cb {Function}
 * @param cb.guid
 * @returns {*}
 */
export function sub(type, target, cb) {
	// console.log(type, target, cb.guid);
	if (!cb.guid) return console.error('callback function need guid');
	fnCache[cb.guid] = cb;

	listeners[type] = listeners[type] || {};
	listeners[type][cb.guid] = listeners[type][cb.guid] || [];
	listeners[type][cb.guid].push(target);

	return cb;
}

/**
 * unsub 卸载消息订阅函数
 * @param type 可指定类型，也可不指定类型(*)
 * @param target 可指定目标，也可不指定(*)
 * @param cb
 * @param cb.guid 回调函数的唯一标识
 */
export function unsub(type, target, cb) {
	if (type != '*' && !listeners[type]) return;
	if (type != '*' && !listeners[type][cb.guid]) return;

	for (let t in listeners) {
		if (type !== '*' && t != type) continue; // 没有指定具体事件类型，那就要遍历找到挂载的函数，再删除

		if (!listeners.hasOwnProperty(t)) continue;
		let targets = listeners[t][cb.guid];
		if (target === '*') targets = [];

		for (let i = 0; i<targets.length;) {
			if (targets[i] === target)
				targets.splice(i, 1);
			else
				i++;
		}

		if (targets.length == 0) {
			delete listeners[t][cb.guid];
			delete fnCache[cb.guid];
		}
		if (util.isEmpty(listeners[t]))
			delete listeners[t];
	}
}