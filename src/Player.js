import * as browser from './browser'
import * as dom from './dom'
import * as util from './util'
import * as message from './message'
import H5Video from './H5Video'
import Panel from './controls/Panel'

/**
 * @param {options}
 * @class
 */
export class Player {
	constructor(options) {
		this.options = options;
		var owner = options.owner;
		if (!owner) return console.error('Player need a container');

		this.subs = [];
		this.subs.push(message.sub('*', '*', util.bind(this, this.handleMsg)));
		this.subs.push(message.sub('*', '*', util.bind(this, this.options.listen)));

		owner = dom.get(owner);
		this.render(owner);

		this.panel = new Panel(this);
		this.panel.render(this.el);
	}
	render(owner) {
		this.el = dom.createEl('div', {'class': 'vcp-player'});

		var h5 = new H5Video(this);
		h5.render(this.el);
		this.video = h5;

		owner.appendChild(this.el);
	}
	setup() {

	}
	destroy() {
		this.video && this.video.destroy();
		message.unsub('*', this.handleMsg);
		message.unsub('*', this.options.listen);
	}
	handleMsg(msg) {
		switch (msg.type) {
			case 'play':
				dom.addClass(this.el, 'vcp-playing');
				break;
			case 'pause':
				dom.removeClass(this.el, 'vcp-playing');
				break;
		}
	}
}