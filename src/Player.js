import * as browser from './browser'
import * as dom from './dom'
import * as util from './util'
import * as message from './message'
import H5Video from './H5Video'
import FlashVideo from './FlashVideo'
import Panel from './controls/Panel'
import BigPlay from './controls/BigPlay'
import Loading from './controls/Loading'

export var MSG = {TimeUpdate: 'timeupdate', Loaded: 'loadeddata', Progress: 'progress', FullScreen: 'fullscreen',
				Play: 'play', Pause: 'pause', Ended: 'ended', Seeking: 'seeking', Seeked: 'seeked'};
/**
 * @param {options}
 * @param options.owner {String} container id
 * @param options.controls {Boolean} 是否显示原生控件
 * @param options.volume {Number} 音量初始化，传0则静音
 * @param options.listener {Function}
 * @method currentTime
 * @method duration
 * @method buffered
 * @class
 */
export default class Player {
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

		if (browser.HASVIDEO) {
			var h5 = new H5Video(this);
			h5.render(this.el);
			this.video = h5;
		} else {
			var flash = new FlashVideo(this);
			flash.render(this.el);
			this.video = flash;
		}
		if (!this.video) return console.error('create video failed');

		owner.appendChild(this.el);

		this.bigplay = new BigPlay(this);
		this.bigplay.render(this.el);

		this.panel = new Panel(this);
		this.panel.render(this.el);

		this.loading = new Loading(this);
		this.loading.render(this.el);

		this.size(this.options.width, this.options.height);
	}
	size(mW, mH) {
		var vW = this.video.videoWidth(),
			vH = this.video.videoHeight();
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

		this.width = dW;
		this.height = dH;
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
			case MSG.Play:
				dom.addClass(this.el, 'vcp-playing');
				break;
			case MSG.Pause:
				dom.removeClass(this.el, 'vcp-playing');
				break;
			case MSG.Ended:
				dom.removeClass(this.el, 'vcp-playing');
				console.log('ended');
				break;
			case MSG.Loaded:
				this.loading.hide();
				this.size(this.options.width, this.options.height);
				break;
			case MSG.Seeking:
				this.loading.show();
				break;
			case MSG.Seeked:
				this.loading.hide();
				break;
			case MSG.FullScreen:
				var self = this;
				setTimeout(function() { // fix IE9 按esc toggle 时背景图片出不来
					dom.toggleClass(self.el, 'vcp-fullscreen', msg.fullscreen);
				}, 0);
				break;
		}

		if (!msg.private && this.listener)
			this.listener(msg);
	}
	
	currentTime(time) {
		return this.video.currentTime(time);
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
	mute(muted) {
		return this.video.mute(muted);
	}
	volume(p) {
		return this.video.volume(p);
	}
	fullscreen(enter) {
		return this.video.fullscreen(enter);
	}
}