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
			{controls: true, preload: 'auto', poster: options.poster, autoplay: options.autoplay ? true : null},
			{src: options.src});

		return super.render(owner);
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
	setup() {
		var events = [
			'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error', 'loadedmetadata', 'loadeddata',
			'loadstart', 'pause', 'play', 'playing', 'progress', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate',
			'volumechange', 'waiting'
		];
		this.on('loadeddata', this.notify);
		// this.on('progress', this.notify);
		this.on('play', this.notify);
		this.on('pause', this.notify);
	}
	notify(e) {
		// console.log(this.__name, e)
		message.pub({type: e.type, src: this.el, target: this.__type, ts: e.timeStamp});
	}
	destroy() {
		super.destroy();
		this.el.parentNode.removeChild(this.el);
	}
}