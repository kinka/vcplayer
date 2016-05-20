import * as dom from './dom'
import * as util from './util'

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
	on(el, type, fn) {
		var self = this;
		if (typeof el === 'string') {
			fn = type;
			type = el;
			el = this.el;
		}
		this.cbs = this.cbs || [];
		var cb = dom.on(el, type, util.bind(this, fn));
		this.cbs.push({fn: cb, el: el, type: type});
	}
	setup() {

	}
	destroy() {
		if (!this.cbs) return;
		for (var i=0; i<this.cbs.length; i++) {
			var cb = this.cbs[i];
			dom.off(cb.el, cb.type, cb.fn);
		}
	}
}