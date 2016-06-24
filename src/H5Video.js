import Component from './Component'
import * as dom from './dom'
import * as util from './util'

var fsApi = util.FullscreenApi;

export default class H5Video extends Component {
	constructor(player) {
		super(player, 'H5Video');
	}
	
	render(owner) {
		var options = this.player.options;
		var controls = typeof options.controls === 'undefined' ? null : options.controls;
		this.createEl('video', {controls: controls, preload: 'auto', autoplay: options.autoplay ? true : null});
		var isM3u8 = options.src.indexOf('.m3u8') > -1 || options.isM3u8;
		if (isM3u8) {
			if (typeof window.Hls == 'undefined')
				dom.loadScript('/dist/libs/hls.js', util.bind(this, this.__hlsLoaded));
			else
				this.__hlsLoaded();
		} else {
			this.el.src = options.src;
		}
		return super.render(owner);
	}
	__hlsLoaded() {
		if (!Hls.isSupported())
			return this.notify({type: 'error', code: 4});
		var hls = new Hls();
		hls.loadSource(this.options.src);
		hls.attachMedia(this.el);
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
		this.on('ended', this.notify);
		this.on('seeking', this.notify);
		this.on('seeked', this.notify);
	}
	notify(e) {
		var msg = {type: e.type, src: this, ts: e.timeStamp};

		switch (e.type) {
			case 'error':
				var Props = {1: 'MEDIA_ERR_ABORTED', 2: 'MEDIA_ERR_DECODE', 3: 'MEDIA_ERR_NETWORK', 4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'};
				msg.detail = (this.el && this.el.error) || {code: e.code};
				msg.detail.reason = Props[msg.detail.code];
				break;
			case 'ended':
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
}