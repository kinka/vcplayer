import * as dom from './dom'
import * as util from './util'
import * as message from './message'

/**
 * @param {player}
 * @param {options}
 * @class Component
 */
export default class Component {
	constructor(player, name, type) {
		this.__name = name;
		this.__type = type;
		this.player = player;
		this.options = player.options;
		this.fnCache = {};
		this.__guid = util.guid();
		// console.log(this.__name, this.__type, this.player.options);
	}
	createEl(tag, attrs, props) {
		return this.el = dom.createEl(tag, attrs, props);
	}
	render(owner) {
		if (owner && this.el) {
			owner.appendChild(this.el);
			this.setup();
		}

		return this.el;
	}
	__getFnGuid(fn) {
		if (fn.guid && String(fn.guid).indexOf('_') == -1) // 没有传bind方法进来，包装下
			return this.__guid + '_' + fn.guid;
		return fn.guid;
	}
	on(el, type, fn) { 
		if (typeof el === 'string') {
			fn = type;
			type = el;
			el = this.el;
		}
		this.cbs = this.cbs || {};

		// 同个类的成员方法在不同实例中，guid仍然相同, 所以再加个对象guid加以区分
		var guid = this.__getFnGuid(fn);
		var firstInstance = !guid;
		var firstInit = guid && !this.fnCache[guid];
		if (firstInstance || firstInit) {
			fn = util.bind(this, fn, this.__guid);
			this.fnCache[fn.guid] = fn;
			guid = fn.guid;
		} else {
			fn = this.fnCache[guid];
		}

		dom.on(el, type, fn);
// todo 最好计算个hash来唯一确定不同元素不同事件的不同函数，先这样子搞吧
		this.cbs[this.fnHash(guid, type)] = {guid: guid, el: el, type: type};
		return fn;
	}
	off(el, type, fn) {
		if (typeof el === 'string') {
			fn = type;
			type = el;
			el = this.el;
		}
		var guid = this.__getFnGuid(fn);

		if (this.fnCache[guid])
			fn = this.fnCache[guid];

		dom.off(el, type, fn);
		delete this.cbs[this.fnHash(guid, type)];
	}
	fnHash(guid, type) {
		return type + '_' + guid;
	}
	handleMsg() {

	}
	setup() {

	}
	destroy() {
		if (!this.cbs) return;
		for (let hash in this.cbs) {
			if (!this.cbs.hasOwnProperty(hash)) continue;
			let cb = this.cbs[hash];
			dom.off(cb.el, cb.type, this.fnCache[cb.guid]);
			delete this.cbs[hash];
		}
		this.fnCache = null;
		this.cbs = null;

		if (this.handleMsg)
			message.unsub('*', this.handleMsg);
	}
}