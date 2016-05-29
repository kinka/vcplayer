import * as dom from './dom'
import * as util from './util'
import * as message from './message'

/**
 * @param {Player} player
 * @param {Object} options
 * @property {Number} guid
 * @property {String} name
 * @property {String} type
 * @method render
 * @method createEl
 * @method on
 * @method off
 * @method sub
 * @method pub
 * @method unsub
 * @class Component
 */
export default class Component {
	constructor(player, name) {
		this.name = name;
		this.player = player;
		this.options = player.options;
		this.fnCache = {};
		this.guid = util.guid();
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

	on(el, type, fn) { 
		if (typeof el === 'string') {
			fn = type;
			type = el;
			el = this.el;
		}
		this.cbs = this.cbs || {};

		// 同个类的成员方法在不同实例中，guid仍然相同, 所以再加个对象guid加以区分
		var guid = getFnGuid(this.guid, fn);
		var firstInstance = !guid;
		var firstUsed = guid && !this.fnCache[guid];
		if (firstInstance || firstUsed) {
			fn = util.bind(this, fn, this.guid);
			this.fnCache[fn.guid] = fn;
			guid = fn.guid;
		} else {
			fn = this.fnCache[guid];
		}

		dom.on(el, type, fn);
// todo 最好计算个hash来唯一确定不同元素不同事件的不同函数，先这样子搞吧
		this.cbs[fnHash(guid, type)] = {guid: guid, el: el, type: type};
		return fn;
	}
	off(el, type, fn) {
		if (typeof el === 'string') {
			fn = type;
			type = el;
			el = this.el;
		}
		var guid = getFnGuid(this.guid, fn);

		if (this.fnCache[guid])
			fn = this.fnCache[guid];

		dom.off(el, type, fn);
		delete this.cbs[fnHash(guid, type)];
	}
	pub(msg) {
		message.pub(msg, this.player);
	}
	sub(type, target, cb) {
		message.sub(type, target, cb, this.player);
	}
	unsub(type, target, cb) {
		message.unsub(type, target, cb, this.player);
	}
	handleMsg() {

	}
	setup() {

	}
	destroy() {
		if (this.handleMsg)
			this.unsub('*', '*', this.handleMsg);

		if (!this.cbs) return;
		for (let hash in this.cbs) {
			if (!this.cbs.hasOwnProperty(hash)) continue;
			let cb = this.cbs[hash];
			dom.off(cb.el, cb.type, this.fnCache[cb.guid]);
			delete this.cbs[hash];
		}
		this.fnCache = null;
		this.cbs = null;
	}
}

function fnHash(guid, type) {
	return type + '_' + guid;
}
function getFnGuid(objGuid, fn) {
	if (fn.guid && String(fn.guid).indexOf('_') == -1) // 没有传bind方法进来，包装下
		return objGuid + '_' + fn.guid;
	return fn.guid;
}