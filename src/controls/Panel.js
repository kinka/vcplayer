import Component from '../Component'
import PlayToggle from './PlayToggle'
import FullscreenToggle from './FullscreenToggle'
import Slider from './Slider'
import Timeline from './Timeline'
import Volume from './Volume'
import Player from '../Player'
import * as dom from '../dom'
import * as util from '../util'

/**
 *
 * @property {Timeline} timeline
 * @property {Volume} volume
 * @property {FullscreenToggle} fullscreen
 * @property {Player} player
 */
export default class Panel extends Component {
	constructor(player) {
		super(player, 'Panel');
	}
	render(owner) {
		this.createEl('div', {'class': 'vcp-controls-panel'});
		this.el.appendChild(dom.createEl('div', {'class': 'vcp-panel-bg'}));
		this.playToggle = new PlayToggle(this.player);
		this.playToggle.render(this.el);

		this.timeline = new Timeline(this.player);
		this.timeline.render(this.el);
		this.timeline.percent(this.player.percent());

		this.fullscreen = new FullscreenToggle(this.player);
		this.fullscreen.render(this.el);
		
		this.volume = new Volume(this.player);
		this.volume.render(this.el);
		this.volume.percent(this.options.volume);

		return super.render(owner);
	}
	setup() {// add play toggle, progress, time label, volume/mute, fullscreen
		var handler = util.bind(this, this.handleMsg);
		// todo 可以批量添加事件
		this.sub(Slider.MSG.Changing, this.volume, handler);
		this.sub(Slider.MSG.Changed, this.timeline.progress, handler);
		this.sub(Player.MSG.TimeUpdate, this.player.video, handler);
		this.sub(Player.MSG.Progress, this.player.video, handler);
		this.sub(Player.MSG.Loaded, this.player.video, handler);
	}
	handleMsg(msg) {
		switch (msg.type) {
			case Player.MSG.Loaded:
				this.timeline.percent(this.player.percent());
				this.timeline.buffered(this.player.buffered());
				break;
			case Player.MSG.TimeUpdate:
				if (!this.timeline.scrubbing)
					this.timeline.percent(this.player.percent());
				break;
			case Player.MSG.Progress:
				this.timeline.buffered(this.player.buffered()); // todo IE9 会最后一段时间就不触发progress了
				break;
			case Slider.MSG.Changed:
				if (msg.src === this.timeline.progress) {
					this.player.percent(this.timeline.percent());
				}
				break;
		}
		
	}
}