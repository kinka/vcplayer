import Component from '../Component'
import PlayToggle from './PlayToggle'
import FullscreenToggle from './FullscreenToggle'
import {MSG as SliderMSG} from './Slider'
import Timeline from './Timeline'
import Timelabel from './Timelabel'
import Volume from './Volume'
import {MSG as PlayerMSG} from '../message'
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
		
		this.timelabel = new Timelabel(this.player);
		this.timelabel.render(this.el);

		this.timeline = new Timeline(this.player);
		this.timeline.render(this.el);

		this.fullscreen = new FullscreenToggle(this.player);
		this.fullscreen.render(this.el);
		
		this.volume = new Volume(this.player);
		this.volume.render(this.el);

		return super.render(owner);
	}
	setup() {// add play toggle, progress, time label, volume/mute, fullscreen
		var handler = util.bind(this, this.handleMsg);
		// todo 可以批量添加事件
		this.sub(SliderMSG.Changing, this.volume, handler);
		this.sub(SliderMSG.Changed, this.timeline.progress, handler);
		this.sub(PlayerMSG.TimeUpdate, this.player.video, handler);
		this.sub(PlayerMSG.Progress, this.player.video, handler);
		this.sub(PlayerMSG.MetaLoaded, this.player.video, handler);
		this.sub(PlayerMSG.Pause, this.player.video, handler);
		this.sub(PlayerMSG.Play, this.player.video, handler);
	}
	handleMsg(msg) {
		switch (msg.type) {
			case PlayerMSG.MetaLoaded:
				this.timeline.percent(this.player.percent());
				this.timeline.buffered(this.player.buffered());
				this.volume.percent(this.options.volume);
				this.show();
				break;
			case PlayerMSG.TimeUpdate:
				if (!this.timeline.scrubbing)
					this.timeline.percent(this.player.percent());
				break;
			case PlayerMSG.Pause:
				this.show();
				break;
			case PlayerMSG.Play:
				this.hide();
				break;
			case PlayerMSG.Progress:
				this.timeline.buffered(this.player.buffered()); // todo IE9 会最后一段时间就不触发progress了
				break;
			case SliderMSG.Changed:
				if (msg.src === this.timeline.progress) {
					this.player.percent(this.timeline.percent());
				}
				break;
		}
	}
	show() {
		if (this.el.style.display === 'block') return;
		
		dom.removeClass(this.el, 'fadeOut');
		dom.addClass(this.el, 'fadeIn');
		var self = this;
		setTimeout(function() {
			self.el.style.display = "block";
		}, 500);
	}
	hide() {
		dom.removeClass(this.el, 'fadeIn');
		dom.addClass(this.el, 'fadeOut');
		var self = this;
		setTimeout(function() {
			self.el.style.display = "none";
		}, 500);
	}
}