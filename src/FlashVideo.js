import Component from './Component'
import {MSG as PlayerMSG} from './message'
import * as dom from './dom'
import * as util from './util'

var State = {Playing: 'PLAYING', Paused: 'PAUSED', Stop: 'STOP', Seeking: 'SEEKING', Seeked: 'SEEKED'};
/**
 *
 * @class FlashVideo
 */
export default class FlashVideo extends Component {
	constructor(player) {
		super(player, 'FlashVideo');

		if (!window.flashCallback) {
			/**
			 *
			 * @param eventName
			 * @param args
			 * @param args.objectID 每个flash播放器的id
			 */
			window.flashCallback = function(eventName, args) {
				args = args && args[0];
				var fn = window.flashCallback.fnObj && window.flashCallback.fnObj[args.objectID];
				fn && fn(eventName, args);
			};
			window.flashCallback.fnObj = {};
		}
	}
	
	render(owner) {
		this.__timebase = +new Date();

		var swfurl = '//imgcache.qq.com/open/qcloud/video/player/release/QCPlayer.swf';
		// swfurl = 'http://test.qzs.qq.com/iot/demo/player/QCPlayer.swf';
		var options = this.player.options;
		var wmode = 'opaque';
		var id = 'obj_vcplayer_' + this.player.guid;
		this.__id = id;
		owner.innerHTML = `
		<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="" id="${id}" width="100%" height="100%">
            <param name="movie"  value="${swfurl}" />
            <param name="quality" value="autohigh" />
            <param name="swliveconnect" value="true" />
            <param name="allowScriptAccess" value="always" />
            <param name="bgcolor" value="#000" />
            <param name="allowFullScreen" value="true" />
            <param name="wmode" value="${wmode}" />
            <param name="FlashVars" value="url=" />

            <embed src="${swfurl}" width="100%" height="100%" name="${id}"
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
		this.cover = dom.createEl('div', {'class': 'vcp-pre-flash'});
		this.owner.appendChild(this.cover);

		window.flashCallback.fnObj[this.__id] = util.bind(this, this.notify);
	}
	setup() {
		this.on('error', this.notify);
	}
	doPolling() {
		if (this.options.live) return; // 直播没必要这个事件
		clearInterval(this.__timer);
		this.__timer = setInterval(this.interval.bind(this), 1000);
	}
	endPolling() {
		clearInterval(this.__timer);
	}
	interval() {
		var info;
		try {
			info = this.el.getState();
		} catch (e) {
			this.endPolling(); // 多次load会导致interval非正常结束，于是一直polling
			return;
		}
		if (this.__m3u8) {
			var tmp = this.currentTime() + info.bufferLength;
			if (this.__buffered !== tmp) {
				this.__buffered = tmp;
				this.pub({type: PlayerMSG.Progress, src: this, ts: new Date() - this.__timebase});
			}

			if (this.__buffered >= this.duration()) // 允许一定误差
				this.endPolling();
		} else if (!this.__rtmp) {
			if (this.__bytesloaded != info.bytesLoaded) {
				this.__bytesloaded = info.bytesLoaded;
				this.pub({type: PlayerMSG.Progress, src: this, ts: new Date() - this.__timebase});
			}
			if (this.__bytesloaded >= this.__bytesTotal)
				this.endPolling();
		}
	}
	destroy() {
		delete window.flashCallback.fnObj[this.__id];
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
	 * @property info.bufferLength
	 * @property info.backBufferLength
	 * @property info.code
	 * @property info.msg
	 */
	notify(eventName, info) {
		var e = {type: eventName, ts: (+new Date() - this.__timebase)};
		try {
			if (this.options.debug) {
				this.pub({type: e.type, src: this, ts: e.ts, detail: util.extend({debug: true}, info)});
			}

			if (this.__m3u8 && !this.__metaloaded && eventName == 'mediaTime' && info.videoWidth != 0) {
				// 修正flash m3u8的metaData时机
				e.type = 'metaData';
				this.__metaloaded = true;
			}

			switch (e.type) {
				case 'ready':
					this.el = getFlashMovieObject(this.__id);
					this.setup();
					// this.el.setAutoPlay();
					this.__timebase = new Date() - info.time;
					this.load(this.options.src);
					return;
					break;
				case 'metaData':
					e.type = PlayerMSG.MetaLoaded;
					this.__videoWidth = info.videoWidth;
					this.__videoHeight = info.videoHeight;
					this.__duration = info.duration;
					this.__bytesTotal = info.bytesTotal;
					this.__prevPlayState = null;
					this.__m3u8 = info.type === util.VideoType.M3U8;
					this.__rtmp = info.type === util.VideoType.RTMP;
					this.__type = info.type;
					if (this.__m3u8) {
						this.volume(0);
						this.__metaloaded = (this.__videoWidth != 0);
						if (!this.__metaloaded) return; // m3u8 没有播放的话是拿不到视频宽高的
					}
					!this.options.autoplay && this.pause();
					this.__metaloaded = true;

					this.doPolling();

					var self = this;
					if (!self.cover) break;
					setTimeout(function() {
						self.owner.removeChild(self.cover);// faded out?
						self.cover = null;
					}, 500);
					break;
				// todo PlayerMSG.Loaded
				case 'playState':
					if (info.playState == State.Playing) {
						this.__playing = true;
						this.__stopped = false;
						e.type = PlayerMSG.Play;
					} else if (info.playState == State.Paused) {
						this.__playing = false;
						this.__stopped = false;
						e.type = PlayerMSG.Pause;
					} else if (info.playState == State.Stop) {
						this.__playing = false;
						this.__stopped = true;
						e.type = PlayerMSG.Ended;
						this.__prevPlayState = null;
					} else {
						return;
					}
					break;
				case 'seekState':
					if (!this.__metaloaded) return;

					if (info.seekState == State.Seeking) {
						e.type = PlayerMSG.Seeking;
					} else if (info.seekState == State.Seeked) {
						if (!this.__m3u8 // m3u8倒没有这个问题
							&& info.playState == State.Paused
							|| info.playState == State.Stop // 播放结束后seek状态不变更，所以强制play以恢复正常状态
						) {
							this.play();
							this.__prevPlayState = info.playState;
						}

						e.type = PlayerMSG.Seeked;
					} else {
						return;
					}
					break;
				case 'netStatus':
					if (!this.options.live) {
						if (info.code == 'NetStream.Buffer.Full') {
							if (this.__prevPlayState == State.Paused || this.__prevPlayState == State.Stop) {
								this.pause();
							}
							this.__prevPlayState = null;
							e.type = PlayerMSG.Seeked;
						} else if (info.code == 'NetStream.Seek.Complete') { // 播放到结尾再点播放会自动停止,所以force play again
							this.play();
							break;
						}
					}
					// todo empty
					if (info.code == 'NetConnection.Connect.Closed') {
						e.type = 'error';
						info = {code: 1001, reason: info.code};
					}

					break;
				case 'mediaTime':
					this.__videoWidth = info.videoWidth;
					this.__videoHeight = info.videoHeight;
					e.type = PlayerMSG.TimeUpdate;
					break;
				case 'error':
					var code = isNaN(parseInt(info.code)) ? 1001 : info.code;
					var reason = isNaN(parseInt(info.code)) ? info.code : info.msg;
					info = {code: code, reason: reason || ''};
					break;
			}

			var keepPrivate = (eventName == 'printLog' || eventName == 'canPlay');
			!keepPrivate && this.pub({type: e.type, src: this, ts: e.ts, detail: info});
		} catch (err) {
			console.error(eventName + ' ' + e.type, err);
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
	play() {
		if (this.__stopped) this.currentTime(0);
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
		var p;
		if (this.__m3u8) {
			return this.__buffered || 0;
		} else {
			p = (this.__bytesloaded || 0) / (this.__bytesTotal || 1);
			return this.duration() * p;
		}
	}
	currentTime(time) {
		if (typeof time === 'undefined') return this.el.getPosition();
		this.el.playerSeek(time);

	}
	duration() {
		return this.__duration;
	}
	mute(muted) {
		if (typeof muted === 'undefined') return this.volume() == 0;
		this.volume(muted ? 0 : this.__lastVol);
	}
	volume(p) {
		if (typeof p === 'undefined') return this.el && this.el.getState().volume;
		this.el && this.el.playerVolume(p);
		p != 0 && (this.__lastVol = p);
		this.pub({type: PlayerMSG.VolumeChange, src: this, ts: new Date() - this.__timebase});
	}

	fullscreen(enter) {
		return util.doFullscreen(this.player, enter, this.owner);
	}

	load(src, type) {
		this.pub({type: PlayerMSG.Load, src: this, ts: (new Date() - this.__timebase), detail: {src: src, type: type}});
		this.el && this.el.playerLoad(src);
	}
	playing() {
		return this.el && this.el.getState().playState === State.Playing;
	}
	type() {
		return this.__type;
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