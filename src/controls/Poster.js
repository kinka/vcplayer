import Component from '../Component'
import * as dom from '../dom'
import * as util from '../util'
import {MSG as PlayerMsg} from '../Player'

export default class Poster extends Component {
	constructor(player) {
		super(player, 'Poster');
		if (typeof this.options.poster == 'object') {
			this.poster = this.options.poster;
		} else if (typeof this.options.poster == 'string') {
			this.poster = {src: this.poster.src}
		}
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-poster'});
		this.hide();

		var poster = this.poster;
		if (poster) {
			this.pic = dom.createEl('img', {'class': 'vcp-poster-pic', 'src': poster.src});
			let self = this;
			let stretch = self.poster.style == 'stretch';
			if (stretch) {
				self.pic.style.cssText = 'width: 100%; height: 100%;';
			} else {
				self.pic.style.cssText = '';
			}
			this.pic.onload = function() {
				self.pic.onload = null;
				self.show();

				if (stretch) return;

				var left = '-' + (self.pic.width / 2) + 'px',
					top = '-' + (self.pic.height / 2) + 'px';
				self.pic.style.cssText += `left: 50%; top: 50%; margin-left: ${left}; margin-top: ${top};`;
			};
			this.el.appendChild(this.pic);
		}

		return super.render(owner);
	}
	setup() {
		this.on('click', this.onClick);
		this.sub(PlayerMsg.Loaded, this.player.video, util.bind(this, this.handleMsg));
		this.sub(PlayerMsg.Play, this.player.video, util.bind(this, this.handleMsg));
		this.sub(PlayerMsg.Pause, this.player.video, util.bind(this, this.handleMsg));
		this.sub(PlayerMsg.Ended, this.player.video, util.bind(this, this.handleMsg));
	}
	onClick() {
		this.pub({type: 'click', src: this});
	}
	handleMsg(msg) {
		console.log('@' + this.name, msg);
		switch (msg.type) {
			case PlayerMsg.Loaded:
				this.__loaded = true;
				break;
			case PlayerMsg.Play:
				if (!this.__loaded) return;
				this.hide();
				break;
			case PlayerMsg.Pause:
			case PlayerMsg.Ended:
				if (!this.__loaded) return;
				this.show();
				break;
		}
	}
	toggle(display) {
		clearTimeout(this.__tid); // 防止跳变
		let self = this;
		this.__tid = setTimeout(function() {
			self.el.style.display = display;
		}, 100);
	}
	hide() {
		this.toggle('none');
	}
	show() {
		this.toggle('block');
	}
}