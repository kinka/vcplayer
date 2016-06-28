import Component from './Component'
import * as dom from './dom'
import * as util from './util'
import {MSG as PlayerMSG}  from './message'

var fsApi = util.FullscreenApi;

export default class H5Video extends Component {
	constructor(player) {
		super(player, 'H5Video');
	}
	
	render(owner) {
		var options = this.player.options;
		var controls = !options.controls ? null : options.controls;
		this.createEl('video', {controls: controls, preload: 'auto', autoplay: options.autoplay ? true : null});
		return super.render(owner);
	}
	__hlsLoaded(src) {
		if (!Hls.isSupported())
			return this.notify({type: 'error', code: 4});
		var hls = new Hls();
		hls.loadSource(src);
		hls.attachMedia(this.el);
	}
	setup() {
		var events = [
			'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error', 'loadedmetadata', 'loadeddata',
			'loadstart', 'pause', 'play', 'playing', 'timeline', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate',
			'volumechange', 'waiting'
		];
		this.__timebase = +new Date();
		this.on(PlayerMSG.MetaLoaded, this.notify);
		this.on(PlayerMSG.Loaded, this.notify);
		this.on(PlayerMSG.Progress, this.notify);
		this.on(PlayerMSG.Play, this.notify);
		this.on(PlayerMSG.Pause, this.notify);
		this.on(PlayerMSG.Error, this.notify);
		this.on(PlayerMSG.TimeUpdate, this.notify);
		this.on(PlayerMSG.Ended, this.notify);
		this.on(PlayerMSG.Seeking, this.notify);
		this.on(PlayerMSG.Seeked, this.notify);

		this.load(this.options.src, this.options.m3u8 ? util.VideoType.M3U8 : '');
	}
	notify(e) {
		var msg = {type: e.type, src: this, ts: e.timeStamp};

		switch (e.type) {
			case PlayerMSG.MetaLoaded:
				this.__timebase = +new Date() - msg.ts;
				break;
			case PlayerMSG.Error:
				var Props = {1: 'MEDIA_ERR_ABORTED', 2: 'MEDIA_ERR_DECODE', 3: 'MEDIA_ERR_NETWORK', 4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'};
				msg.detail = (this.el && this.el.error) || {code: e.code};
				msg.detail.reason = Props[msg.detail.code];
				break;
			case PlayerMSG.Ended:
				this.pause(); // IE9 不会自动改变播放状态，导致伪全屏的时候出现黑屏
				break;
		}

		this.pub(msg);
	}

	videoWidth() {
		return this.el.videoWidth;
	}
	videoHeight() {
		return this.el.videoHeight;
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
		if (typeof time === 'undefined') return this.el.currentTime;
		
		return this.el.currentTime = time;
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

	fullscreen(enter) {
		return util.doFullscreen(this.player, enter, this.owner);
	}
	
	load(src, type) {
		this.pub({type: PlayerMSG.Load, src: this, ts: +new Date() - this.__timebase, detail: {src: src, type: type}});
		var isM3u8 = src.indexOf('.m3u8') > -1 || type == util.VideoType.M3U8;
		if (isM3u8) {
			this.__type = util.VideoType.M3U8;
			var self = this;
			if (typeof window.Hls == 'undefined')
				dom.loadScript(util.CDNPath + 'libs/hls.js', function() {self.__hlsLoaded.call(self, src)});
			else
				this.__hlsLoaded(src);
		} else {
			this.__type = type;
			this.el.src = src;
		}
	}
	playing() {
		return !this.el.paused;
	}
	type() {
		return this.__type;
	}
}