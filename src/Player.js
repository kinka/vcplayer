import './css/vcplayer.css';

import * as __browser from './browser'
import * as __dom from './dom'
import * as __util from './util'
import * as message from './message'
import H5Video from './H5Video'
import FlashVideo from './FlashVideo'
import Panel from './controls/Panel'
import BigPlay from './controls/BigPlay'
import Poster from './controls/Poster'
import Loading from './controls/Loading'
import ErrorTips from './controls/ErrorTips'

export var MSG = message.MSG;
export var browser = __browser;
export var util = __util;
export var dom = __dom;
/**
 * @param {options}
 * @param options.owner {String} container id
 * @param options.controls {Boolean} 是否显示原生控件
 * @param options.volume {Number} 音量初始化，传0则静音
 * @param options.listener {Function}
 * @param options.poster {Object|String}
 * @param options.m3u8 {Boolean}
 * @param options.live {Boolean} 是否直播
 * @param options.debug {Boolean} 是否调试状态
 * @param options.flash {Boolean} 优先使用flash
 * @param options.wording {Object} 自定义提示语
 * @method currentTime
 * @method duration
 * @method buffered
 * @class
 */
export class Player {
	constructor(options) {
		this.options = options;
		var owner = options.owner;
		if (!owner) return console.error('Player need a container');

		this.guid = util.guid();

		this.listener = this.options.listener;
		message.sub('*', '*', util.bind(this, this.handleMsg), this);

		owner = dom.get(owner);
		this.render(owner);
	}
	render(owner) {
		var clsName = 'vcp-player';
		if (browser.TOUCH_ENABLED) clsName += ' touchable';
		this.el = dom.createEl('div', {'class': clsName});

		if (!this.options.flash && browser.HASVIDEO) {
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

		this.poster = new Poster(this);
		this.poster.render(this.el);

		if (!this.options.controls) {
			this.bigplay = new BigPlay(this);
			this.bigplay.render(this.el);

			this.panel = new Panel(this);
			this.panel.render(this.el);
		}

		this.errortips = new ErrorTips(this);
		this.errortips.render(this.el);

		this.loading = new Loading(this);
		this.loading.render(this.el);

		this.options.width = this.options.width || owner.offsetWidth;
		this.options.height = this.options.height || owner.offsetHeight;
		this.size(this.options.width, this.options.height);

		this.setup();
	}

	/**
	 *
	 * @param mW
	 * @param mH
	 * @param style [String] fit | cover
	 */
	size(mW, mH, style) {
		style = style || 'cover';
		let percent = /^\d+\.?\d{0,2}%$/;
		let dW, dH;
		if(percent.test(mW) || percent.test(mH)){ //百分数
			dW = mW;
			dH = mH;
		}else{
			let vW = this.video.videoWidth(),
				vH = this.video.videoHeight();

			dW = mW;
			dH = mH;
			if (vW && vH) {
				let ratio = vW / vH;
				// console.log(ratio, vW, vH, mW, mH)
				if (style == 'fit') {
					dW = mW;
					dH = dW / ratio;
					if (dH > mH) { // 高度超出容器
						dW *= mH / dH;
						dH = mH;
					}
				}
			}
		}

		dW += (percent.test(dW)? '' : 'px');
		dH += (percent.test(dH)? '' : 'px');
		//console.log(dH);
 		this.el.style.width = dW;
		this.el.style.height = dH;

		this.video.width(dW);
		this.video.height(dH);

		this.width = dW;
		this.height = dH;
	}
	setup() {
		this.__handleEvent = util.bind(this, this.handleEvent);
	}
	destroy() {
		this.video && this.video.destroy();
		this.panel && this.panel.destroy();
		this.bigplay && this.bigplay.destroy();
		this.loading && this.loading.destroy();
		message.unsub('*', '*', this.handleMsg, this);
		this.video = this.panel = this.bigplay = this.loading = null;
	}
	setListener(listener) {
		this.listener = listener;
	}
	handleEvent(e) {
		switch (e.type) {
			case 'mousemove':
				// 播放时检测鼠标是否移动，如果移动则出现控制栏
				if (this.__lastmove && new Date() - this.__lastmove < 100)
					break;

				var self = this;
				this.__movecnt = this.__movecnt || 0;
				this.__movecnt++;
				if (this.__movecnt < 5) {
					setTimeout(function() {
						self.__movecnt = 0;
					}, 500);
					break;
				}
				this.__movecnt = 0;

				this.__lastmove = +new Date();
				clearTimeout(this.__moveid);

				self.panel && self.panel.show();
				this.__moveid = setTimeout(function() {
					self.playing() && self.panel && self.panel.hide();
				}, 3000);
				break;
		}
	}
	handleMsg(msg) {
		switch (msg.type) {
			case MSG.Play:
				if (!this.playing()) break;

				dom.addClass(this.el, 'vcp-playing');
				if (this.video.type() == util.VideoType.RTMP) {
					this.__wait = true;
					this.loading.show();
				}

				dom.on(this.el, 'mousemove', this.__handleEvent);
				break;
			case MSG.TimeUpdate:
				if (this.__wait) {
					this.__wait = false;
					this.loading.hide();
				}
				break;
			case MSG.Pause:
				dom.off(this.el, 'mousemove', this.__handleEvent);
				
				dom.removeClass(this.el, 'vcp-playing');
				break;
			case MSG.Ended:
				dom.off(this.el, 'mousemove', this.__handleEvent);
				this.panel && this.panel.show();
				dom.removeClass(this.el, 'vcp-playing');
				break;
			case MSG.MetaLoaded:
				if (this.options.autoplay && this.video.type() == util.VideoType.RTMP) {
					this.__wait = true;
					this.loading.show();
				} else {
					this.loading.hide();
				}
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
					dom.toggleClass(self.el, 'vcp-fullscreen', msg.detail.isFullscreen);
				}, 0);
				break;
			case MSG.Error:
				this.loading.hide();
				this.errortips.show(msg.detail);
				this.panel && this.panel.show();
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
		//console.log(parseInt(this.video.duration() * p), p);
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
	load(src, type) {
		this.loading.show();
		this.video.load(src, type);
	}
	playing() {
		return this.video.playing();
	}
}