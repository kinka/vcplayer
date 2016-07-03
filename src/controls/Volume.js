import Slider, {MSG as SliderMSG} from './Slider'
import Component from '../Component'
import * as dom from '../dom'
import * as util from '../util'
import {MSG as PlayerMSG} from '../message'

/**
 * @method percent
 * @property {Slider} volume
 * @class Timeline
 */
export default class Volume extends Component {
	constructor(player) {
		super(player, 'Volume');
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-volume'});
		this.bg = dom.createEl('div', {'class': 'vcp-volume-bg'});
		this.el.appendChild(this.bg);

		this.volume = new Slider(this.player, true);
		this.volume.render(this.el);
		this.track = this.volume.track;

		this.icon = dom.createEl('span', {'class': 'vcp-volume-icon'});
		this.el.appendChild(this.icon);

		return super.render(owner);
	}
	setup() {
		this.sub(SliderMSG.Changing, this.volume, util.bind(this, this.handleMsg));
		this.sub(SliderMSG.Changed, this.volume, util.bind(this, this.handleMsg));
		this.sub(PlayerMSG.VolumeChange, this.player.video, util.bind(this, this.handleMsg));
		this.on(this.icon, 'click', this.toggleMute);
	}
	handleMsg(msg) {
		switch (msg.type) {
			case SliderMSG.Changing:
				this.syncTrack(this.percent());
				break;
			case SliderMSG.Changed:
				this.percent(this.percent());
				break;
			case PlayerMSG.VolumeChange:
				var p = this.player.volume();
				this.syncTrack(p);
				this.syncMute(this.player.mute());
				break;
		}
	}
	toggleMute(e) {
		var muted = !(this.player.mute());
		this.player.mute(muted);
	}
	syncMute(muted) {
		if (muted)
			dom.addClass(this.el, 'vcp-volume-muted');
		else
			dom.removeClass(this.el, 'vcp-volume-muted');
		this.__muted = muted;
	}
	syncTrack(p) {
		this.track.style.height = p*100 + '%';
		this.volume.percent(1 - p);
		if (p == 0) {
			this.syncMute(true);
		} else if (p > 0 && this.__muted) {
			this.syncMute(false);
		}
	}
	percent(p) {
		if (typeof p === 'undefined') return 1 - this.volume.percent() || 0;

		this.player.volume(p);
		return p;
	}
}