import Component from './Component'
import * as dom from './dom'
import * as message from './message'

export default class H5Video extends Component {
	constructor(player) {
		super(player, 'H5Video', 'video');
	}
	
	render(owner) {
		var options = this.player.options;
		this.createEl('video',
			{controls: true, preload: 'auto', poster: options.poster || '', autoplay: options.autoplay ? true : null},
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
			return this.el.buffered.end(0);
		else
			return 0;
	}
	currentTime(time) {
		if (time)
			return this.el.currentTime = time;
		else
			return this.el.currentTime;
	}
	duration() {
		return this.el.duration || 0;
	}
}