import Component from '../Component'
import PlayToggle from './PlayToggle'
import FullscreenToggle from './FullscreenToggle'
import {MSG as SliderMSG} from './Slider'
import Timeline from './Timeline'
import Timelabel from './Timelabel'
import Volume from './Volume'
import ClaritySwitcher from './ClaritySwitcher'
import {MSG as PlayerMSG} from '../message'
import * as dom from '../dom'
import * as util from '../util'
import * as B from '../browser'

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

		//if (!B.IS_X5TBS) {
			this.fullscreen = new FullscreenToggle(this.player);
			this.fullscreen.render(this.el);	
		//}

		if (!B.IS_MOBILE) {
			this.volume = new Volume(this.player);
			this.volume.render(this.el);
		}

		if(this.options.videoSource && this.options.videoSource.definitions.length > 1 && !B.IS_MOBILE){
			this.claritySwitcher = new ClaritySwitcher(this.player);
			this.claritySwitcher.render(this.el);
		}

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
		this.sub(PlayerMSG.Ended, this.player.video, handler);
	}
	handleMsg(msg) {
		switch (msg.type) {
			case PlayerMSG.MetaLoaded:
				//util.console.log('panel MetaLoaded');
				this.timeline.percent(this.player.percent());
				this.timeline.buffered(this.player.buffered());
				this.player.volume(typeof this.options.volume === 'undefined' ? 0.5 : this.options.volume);
				!this.options.autoplay && this.show();
				break;
			case PlayerMSG.TimeUpdate:
				if (!this.timeline.scrubbing)
					this.timeline.percent(this.player.percent());
				break;
			case PlayerMSG.Pause:
				//util.console.log('panel Pause');
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
			case PlayerMSG.Ended:
				this.show();
				break;
		}
	}
	toggle() {
		if(dom.hasClass(this.el,'show')) this.hide();
		//if (this.el.style.display === 'block') this.hide();
		else this.show();
	}
	show() {
		//if (this.el.style.display === 'block') return;
		if(dom.hasClass(this.el,'hide')){
			dom.removeClass(this.el, 'hide');
			dom.addClass(this.el, 'show');
		}
		//var self = this;
		//setTimeout(function() {
		//	self.el.style.display = "block";
		//}, 500);
		//util.console.log('show()');
	}
	hide() {
		//if(dom.hasClass(this.el,'show')){
			dom.removeClass(this.el, 'show');
			dom.addClass(this.el, 'hide');
		//}

		//var self = this;
		//setTimeout(function() {
		//	self.el.style.display = "none";
		//}, 500);
		//util.console.log('hide()');
	}
}