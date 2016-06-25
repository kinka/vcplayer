import Component from '../Component'
import * as dom from '../dom'
import * as util from '../util'
import {MSG as PlayerMsg} from '../message'

export default class Poster extends Component {
	constructor(player) {
		super(player, 'Poster');
		if (typeof this.options.poster == 'object') {
			this.poster = this.options.poster;
		} else if (typeof this.options.poster == 'string') {
			this.poster = {src: this.options.poster}
		}
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-poster'});
		this.hide();

		var poster = this.poster;
		if (poster) {
			this.pic = dom.createEl('img', {'class': 'vcp-poster-pic'});
			let stretch = this.poster.style == 'stretch';
			if (stretch) {
				this.pic.style.cssText = 'width: 100%; height: 100%;';
			} else {
				this.pic.style.cssText = '';
			}
			this.el.appendChild(this.pic);

			// this.setPoster(this.poster.start);
		}

		return super.render(owner);
	}
	setup() {
		this.on('click', this.onClick);
		this.sub(PlayerMsg.Load, this.player.video, util.bind(this, this.handleMsg));
		this.sub(PlayerMsg.Loaded, this.player.video, util.bind(this, this.handleMsg));
		this.sub(PlayerMsg.Play, this.player.video, util.bind(this, this.handleMsg));
		this.sub(PlayerMsg.Pause, this.player.video, util.bind(this, this.handleMsg));
		this.sub(PlayerMsg.Ended, this.player.video, util.bind(this, this.handleMsg));
	}
	onClick() {
		this.pub({type: 'click', src: this});
	}
	handleMsg(msg) {
		// console.log('@' + this.name, msg);
		switch (msg.type) {
			case PlayerMsg.Load:
				this.__loaded = false;
				break;
			case PlayerMsg.Loaded:
				this.__loaded = true;
				if (this.player.playing())
					this.hide();
				else
					this.setPoster(this.poster.start);
				break;
			case PlayerMsg.Play:
				if (!this.__loaded) break;
				this.hide();
				break;
			case PlayerMsg.Pause:
				if (!this.__loaded) break;
				this.setPoster(this.poster.pause);
				break;
			case PlayerMsg.Ended:
				if (!this.__loaded) break;
				this.setPoster(this.poster.end);
				break;
		}
	}
	setPoster(src) {
		src = src || this.poster.src;
		if (!src) return;

		if (this.__preload) this.__preload.onload = null; // 图片加载是异步的，所以要清除迟到的onload
		this.__preload = new Image();

		var img = this.__preload;

		this.hide();
		let self = this;
		img.onload = function() {
			self.pic.src = img.src;
			self.show();

			let stretch = self.poster.style == 'stretch';
			if (stretch) return;

			var left = '-' + (img.width / 2) + 'px',
				top = '-' + (img.height / 2) + 'px';

			self.pic.style.cssText = `left: 50%; top: 50%; margin-left: ${left}; margin-top: ${top};`;
		};

		img.src = src;
	}
	toggle(display) {
		clearTimeout(this.__tid); // 防止跳变
		let self = this;
		this.__tid = setTimeout(function() {
			self.el.style.display = display;
		}, 100);
	}
	hide() {
		this.__preload && (this.__preload.onload = null);
		this.toggle('none');
	}
	show() {
		this.toggle('block');
	}
}