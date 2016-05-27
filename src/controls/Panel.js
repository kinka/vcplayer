import Component from '../Component'
import PlayToggle from './PlayToggle'
import Slider from './Slider'
import Timeline from './Timeline'
import Player from '../Player'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

/**
 *
 * @property {Slider} progress
 * @property {Slider} volume
 * @property {Player} player
 */
export default class Panel extends Component {
	constructor(player) {
		super(player, 'Panel', 'panel');
	}
	render(owner) {
		this.createEl('div', {'class': 'vcp-controls-panel'});
		this.el.appendChild(dom.createEl('div', {'class': 'vcp-panel-bg'}));
		this.playToggle = new PlayToggle(this.player);
		this.playToggle.render(this.el);

		this.timeline = new Timeline(this.player);
		this.timeline.render(this.el);
		this.timeline.percent(this.player.percent());

		this.volume = new Slider(this.player, true);
		this.volume.render(this.el);
		this.volume.percent(0.5);
		this.volume.el.style.float = 'right';

		this.sub(Slider.MSG.Change, this.volume, util.bind(this, this.handleMsg));
		this.sub(Slider.MSG.Change, this.timeline.slider, util.bind(this, this.handleMsg));
		this.sub(Player.MSG.TimeUpdate, '*', util.bind(this, this.handleMsg));
		this.sub(Player.MSG.Progress, '*', util.bind(this, this.handleMsg));

		return super.render(owner);
	}
	handleMsg(msg) {
		switch (msg.type) {
			case Player.MSG.TimeUpdate:
				this.timeline.percent(this.player.percent());
				break;
			case Player.MSG.Progress:
				this.timeline.buffered(this.player.buffered());
				break;
			case Slider.MSG.Change:
				if (msg.src === this.timeline.slider)
					this.player.percent(this.timeline.percent());
				break;
		}
		
	}
	setup() {
		// add play toggle, progress, time label, volume/mute, fullscreen
	}
}