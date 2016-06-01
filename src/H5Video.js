import Component from './Component'
import Player from './Player'
import * as dom from './dom'
import * as util from './util'
import * as message from './message'

var fsApi = util.FullscreenApi;

export default class H5Video extends Component {
	constructor(player) {
		super(player, 'H5Video');
	}
	
	render(owner) {
		var options = this.player.options;
		this.createEl('video',
			{controls: options.controls, preload: 'auto', poster: options.poster || '', autoplay: options.autoplay ? true : null},
			{src: options.src});

		return super.render(owner);
	}
	setup() {
		var events = [
			'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error', 'loadedmetadata', 'loadeddata',
			'loadstart', 'pause', 'play', 'playing', 'timeline', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate',
			'volumechange', 'waiting'
		];
		this.on('loadeddata', this.notify);
		this.on('progress', this.notify);
		this.on('play', this.notify);
		this.on('pause', this.notify);
		this.on('error', this.notify);
		this.on('timeupdate', this.notify);
	}
	notify(e) {
		if (e.type === 'error')
			console.log(this.el.error);

		this.pub({type: e.type, src: this, ts: e.timeStamp});
	}
	destroy() {
		this.el.parentNode.removeChild(this.el);
		super.destroy();
	}
	
	width(w) {
		if (!w) return this.el.width;
		else this.el.width = w;
	}
	height(h) {
		if (!h) return this.el.height;
		else this.el.height = h;
	}
	play() {
		this.el.play();
	}
	pause() {
		this.el.pause();
	}
	stop() {
		this.el.stop();
	}
	paused() {
		return this.el.paused;
	}
	buffered() {
		if (this.el.buffered.length >= 1)
			return this.el.buffered.end(this.el.buffered.length - 1);
		else
			return 0;
	}
	currentTime(time) {
		if (time)
			return this.el.currentTime = Math.min(time, this.buffered());
		else
			return this.el.currentTime;
	}
	duration() {
		return this.el.duration || 0;
	}
	mute(muted) {
		if (typeof muted === 'undefined') return this.el.muted;
		else return this.el.muted = muted;
	}
	volume(p) {
		if (typeof p === 'undefined') return this.el.volume;
		if (p < 0) p = 0;
		if (p > 1) p = 1;
		return this.el.volume = p;
	}
	__documentFullscreenChange(e) {
		this.__isFullcreen = !!(document[fsApi.fullscreenElement]); // 取消全屏的时候返回的是null, 由此可判断全屏状态

		if (!this.__isFullcreen) {
			this.off(document, fsApi.fullscreenchange, this.__documentFullscreenChange);
		}
		this.pub({type: Player.MSG.FullScreen, src: this, ts: e.timestamp, fullscreen: this.__isFullcreen});
	}
	fullscreen(enter) {
		if (typeof enter === 'undefined') return this.__isFullcreen || false;

		if (fsApi.requestFullscreen) {
			if (enter) {
				this.on(document, fsApi.fullscreenchange, util.bind(this, this.__documentFullscreenChange));
				this.owner[fsApi.requestFullscreen]();
			} else {
				document[fsApi.exitFullscreen]();
			}
		} else { // 伪全屏,可以引导再按个F11
			this.__isFullcreen = enter;

			if (this.__isFullcreen) {
				this.__origOverflow = document.documentElement.style.overflow;
				document.documentElement.style.overflow = 'hidden'; // hide any scroll bars
			} else {
				document.documentElement.style.overflow = this.__origOverflow;
			}


			dom.toggleClass(document.body, 'vcp-full-window', enter);
			this.pub({type: Player.MSG.FullScreen, src: this, fullscreen: this.__isFullcreen});
		}
	}
}