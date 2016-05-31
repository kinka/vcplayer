import * as browser from './browser'
import * as dom from './dom'
import * as util from './util'
import * as message from './message'
import H5Video from './H5Video'
import Panel from './controls/Panel'

const MSG = {TimeUpdate: 'timeupdate', Loaded: 'loadeddata', Progress: 'progress'};
/**
 * @param {options}
 * @param options.owner {String} container id
 * @param options.listener {Function}
 * @method currentTime
 * @method duration
 * @method buffered
 * @class
 */
export default class Player {
	static get MSG() {return MSG;}
	constructor(options) {
		this.options = options;
		var owner = options.owner;
		if (!owner) return console.error('Player need a container');

		this.guid = util.guid();

		owner = dom.get(owner);
		this.render(owner);

		this.listener = this.options.listener;
		message.sub('*', '*', util.bind(this, this.handleMsg), this);
	}
	render(owner) {
		this.el = dom.createEl('div', {'class': 'vcp-player'});

		var h5 = new H5Video(this);
		h5.render(this.el);
		this.video = h5;

		owner.appendChild(this.el);

		this.panel = new Panel(this);
		this.panel.render(this.el);

		this.size(this.options.width, this.options.height);
	}
	size(mW, mH) {
		var vW = this.video.el.videoWidth,
			vH = this.video.el.videoHeight;
		var dW = mW, dH = mH;
		if (vW && vH) {
			var ratio = vW / vH;
			// console.log(ratio, vW, vH, mW, mH)
			var vertical = mW / mH < 1;

			if (vertical) { // 高度优先
				dH = mH;
				dW = dH * ratio;
			} else {
				dW = mW;
				dH = dW / ratio;
			}
		}

		// console.log(dW, dH)
		this.video.width(dW);
		this.video.height(dH);

		this.el.style.width = dW + 'px';
		this.el.style.height = dH + 'px';
	}
	setup() {

	}
	destroy() {
		this.video && this.video.destroy();
		this.panel && this.panel.destroy();
		message.unsub('*', '*', this.handleMsg, this);
	}
	setListener(listener) {
		this.listener = listener;
	}
	handleMsg(msg) {
		switch (msg.type) {
			case 'play':
				dom.addClass(this.el, 'vcp-playing');
				break;
			case 'pause':
				dom.removeClass(this.el, 'vcp-playing');
				break;
			case 'loadeddata':
				this.size(this.options.width, this.options.height);
				break;
		}

		if (!msg.private && this.listener)
			this.listener(msg);
	}
	
	currentTime() {
		return this.video.currentTime();
	}
	duration() {
		return this.video.duration();
	}
	percent(p) {
		if (!this.video.duration()) return 0;
		if (!p) return this.video.currentTime() / this.video.duration();
		this.video.currentTime(this.video.duration() * p);
	}
	buffered() {
		if (!this.video.duration()) return 0;
		return this.video.buffered() / this.video.duration();
	}
	pause() {
		this.video.pause();
	}
	play() {
		this.video.play();
	}
}