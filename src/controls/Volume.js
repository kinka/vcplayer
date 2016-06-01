import Slider from './Slider'
import Component from '../Component'
import * as dom from '../dom'
import * as util from '../util'

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
		this.sub(Slider.MSG.Changing, this.volume, util.bind(this, this.handleMsg));
		this.sub(Slider.MSG.Changed, this.volume, util.bind(this, this.handleMsg));
		this.on(this.icon, 'click', this.muteClick);
	}
	handleMsg(msg) {
		if (msg.type === Slider.MSG.Changing) {
			this.syncTrack(this.percent());
		} else if (msg.type === Slider.MSG.Changed) {

		}
	}
	muteClick(e) {
		var muted = typeof e === 'boolean' ? e : !(this.player.mute());
		this.player.mute(muted);

		if (muted)
			dom.addClass(this.el, 'vcp-volume-muted');
		else
			dom.removeClass(this.el, 'vcp-volume-muted');
	}
	syncTrack(p) {
		this.track.style.height = p*100 + '%';
		this.player.volume(p);
		this.muteClick(p == 0);
	}
	percent(p) {
		if (typeof p === 'undefined') return 1 - this.volume.percent() || 0;

		this.syncTrack(p);
		return this.volume.percent(1 - p);
	}
}