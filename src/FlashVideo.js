import Component from './Component'
import Player, {MSG as PlayerMSG} from './Player'
import * as dom from './dom'
import * as util from './util'

/**
 *
 * @class FlashVideo
 */
export default class FlashVideo extends Component {
	constructor(player) {
		super(player, 'FlashVideo');

		var self = this;
		window.flashCallback = function(eventName, args) {
			self.notify(eventName, args && args[0]);
		};
	}
	
	render(owner) {
		this.__timebase = +new Date();

		var swfurl = 'http://imgcache.qq.com/open/qcloud/video/player/release/QCPlayer.swf';
		swfurl = 'http://test.qzs.qq.com/iot/demo/player/QCPlayer.swf';
		var options = this.player.options;
		var wmode = 'opaque';
		var id = 'obj_vcplayer_' + this.player.guid;
		this.__id = id;
		owner.innerHTML = `
		<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="" id="${id}" width="${options.width}" height="${options.height}">
            <param name="movie"  value="${swfurl}" />
            <param name="quality" value="autohigh" />
            <param name="swliveconnect" value="true" />
            <param name="allowScriptAccess" value="always" />
            <param name="bgcolor" value="#000" />
            <param name="allowFullScreen" value="true" />
            <param name="wmode" value="${wmode}" />
            <param name="FlashVars" value="url=" />

            <embed src="${swfurl}" width="${options.width}" height="${options.height}" name="${id}"
                   quality="autohigh"
                   bgcolor="#000"
                   align="middle" allowFullScreen="true"
                   allowScriptAccess="always"
                   type="application/x-shockwave-flash"
                   swliveconnect="true"
                   wmode="${wmode}"
                   FlashVars="url="
                   pluginspage="http://www.macromedia.com/go/getflashplayer" >
            </embed>
        </object>
		`;
		this.owner = owner;
	}
	setup() {
		this.on('error', this.notify);
	}
	doPolling() {
		clearInterval(this.__timer);
		this.__timer = setInterval(this.interval.bind(this), 500);
	}
	endPolling() {
		clearInterval(this.__timer);
	}
	interval() {
		var info = this.el.getState();
		if (this.__bytesloaded != info.bytesLoaded) {
			this.__bytesloaded = info.bytesLoaded;
			this.pub({type: PlayerMSG.Progress, src: this, ts: +new Date()});
		}
		if (this.__bytesloaded >= this.__bytesTotal)
			this.endPolling();
	}
	destroy() {
		this.endPolling();
		super.destroy();
	}
	/**
	 *
	 * @param eventName
	 * @param info
	 * @property info.bytesLoaded
	 * @property info.bytesTotal
	 * @property info.playState
	 * @property info.seekState
	 */
	notify(eventName, info) {
		try {
			var e = {type: eventName, ts: Math.round(+new Date() - this.__timebase)};

			// if (eventName != 'mediaTime' && eventName != 'printLog' && eventName != 'netStatus')
			// 	console.log(eventName, info);
			var keepPrivate = (eventName == 'printLog' || eventName == 'canPlay');
			switch (e.type) {
				case 'ready':
					this.el = getFlashMovieObject(this.__id);
					this.setup();
					this.el.setAutoPlay(this.options.autoplay);
					this.el.playerLoad(this.options.src);
					this.__timebase = new Date() - info * 1000;
					return;
					break;
				case 'metaData':
					e.type = PlayerMSG.Loaded;
					this.__videoWidth = info.videoWidth;
					this.__videoHeight = info.videoHeight;
					this.__duration = info.duration;
					this.__bytesTotal = info.bytesTotal;
					this.__prevPlayState = null;
					this.doPolling();
					break;
				case 'playState':
					if (info.playState == 'PLAYING') {
						this.__playing = true;
						e.type = PlayerMSG.Play;
					} else if (info.playState == 'PAUSED') {
						this.__playing = false;
						e.type = PlayerMSG.Pause;
					} else if (info.playState == 'STOP') {
						this.__playing = false;
						e.type = PlayerMSG.Ended;
						this.__prevPlayState = null;
					}
					break;
				case 'seekState':
					if (info.seekState == 'SEEKING') {
						e.type = PlayerMSG.Seeking;
					} else if (info.seekState == 'SEEKED' && (info.playState == 'PAUSED'
							|| info.playState == 'STOP' // 播放结束后seek状态不变更，所以强制play以恢复正常状态
						)) {
						this.play();
						this.__prevPlayState = info.playState;
					}
					break;
				case 'netStatus':
					if (info.code == 'NetStream.Buffer.Full') {
						if (this.__prevPlayState == 'PAUSED' || this.__prevPlayState == 'STOP') {
							this.pause();
						}
						this.__prevPlayState = null;
						e.type = PlayerMSG.Seeked;
					} else if (info.code == 'NetStream.Seek.Complete') { // 播放到结尾再点播放会自动停止,所以force play again
						// todo 不确定 需要重新解决下这个问题
						// this.play(true);
					} else {
						return; // 信息太多了。。。
					}
					break;
				case 'mediaTime':
					e.type = PlayerMSG.TimeUpdate;
					break;
				case 'error':
					info = {reason: info.code};
					break;
			}

			!keepPrivate && this.pub({type: e.type, src: this, ts: e.ts, detail: info});
		} catch (e) {
			console.log(eventName, e);
		}
	}

	handleMsg(msg) {

	}
	videoWidth() {
		return this.__videoWidth;
	}
	videoHeight() {
		return this.__videoHeight;
	}
	width(w) {
		if (typeof w === 'undefined') return this.el && this.el.width;
		w = '100%';
		return this.el && (this.el.width = w);
	}
	height(h) {
		if (typeof h === 'undefined') return this.el && this.el.height;
		h = '100%';
		return this.el && (this.el.height = h);
	}
	play(replay) {
		if (replay) this.currentTime(0);
		this.el.playerResume();
	}
	pause() {
		this.el.playerPause();
	}
	stop() {
		this.el.playerStop();
	}
	paused() {
		return !this.__playing;
	}
	buffered() {
		var p = (this.__bytesloaded || 0) / (this.__bytesTotal || 1);
		return this.duration() * p;
	}
	currentTime(time) {
		if (typeof time === 'undefined') return this.el.getPosition();
		this.el.playerSeek(time);

	}
	duration() {
		return this.__duration;
	}
	mute(muted) {
		if (typeof muted === 'undefined') return false;
		this.volume(muted ? 0 : 0.5);
	}
	volume(p) {
		if (typeof p === 'undefined') return 0.5;
		this.el && this.el.playerVolume(p);
	}

	fullscreen(enter) {
		return util.doFullscreen(this.player, enter, this.owner);
	}
}

/**
 *
 * @param movieName
 * @returns {Object} el
 * @property {Function} el.getDuration
 * @property {Function} el.getPosition
 * @property {Function} el.playerPlay
 * @property {Function} el.playerResume
 * @property {Function} el.playerPause
 * @property {Function} el.setAutoPlay
 * @property {Function} el.playerLoad
 * @property {Function} el.getbufferLength
 * @property {Function} el.playerSeek
 * @property {Function} el.playerVolume
 * @property {Function} el.playerStop
 * @property {Function} el.getPlayState
 * @property {Function} el.getState
 */
function getFlashMovieObject(movieName) {
	if (window.document[movieName])	{
		return window.document[movieName];
	}
	if (navigator.appName.indexOf("Microsoft Internet")==-1) {
		if (document.embeds && document.embeds[movieName])
			return document.embeds[movieName];
	} else {
		return document.getElementById(movieName);
	}
}