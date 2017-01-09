import Component from './Component'
import * as dom from './dom'
import * as util from './util'
import {MSG as PlayerMSG}  from './message'
import * as States from './constant/States.js'

var fsApi = util.FullscreenApi;

export default class H5Video extends Component {
	constructor(player) {
		super(player, 'H5Video');
	}
	
	render(owner) {
		var options = this.player.options;
		//controls default||'' 显示默认控件，none 不显示控件，system H5显示系统控件
		var controls = options.controls == 'system' ? '' : null;
		var autoplay = options.autoplay ? true : null;
		//使用video poster属性，不用自定义的方式
		var poster;
		if (options.poster && typeof options.poster == 'object') {
			poster = options.poster.src;
		} else if (typeof options.poster == 'string') {
			poster = options.poster
		} else {
			poster = null;
		}

		this.createEl('video', {
			'controls': controls,
			'preload': 'auto',
			'autoplay': autoplay,
			'webkit-playsinline': '',//空值即设置空值属性，符合w3c标准
			'playsinline': '',
			'x-webkit-airplay': 'allow', //查资料准确的值应该是allow
			'x5-video-player-type': options.x5_type == 'h5'? 'h5' : null, //设置后激活播放的视频无法playinline，可以覆盖，只能伪全屏
			'x5-video-player-fullscreen' :  options.x5_fullscreen ? true : null//设置后激活播放的视频无法playinline，可以覆盖，可以全屏
		});
		/**
		 *
		 'x5-video-player-type': 'h5',
		 'x5-video-player-fullscreen' : 'true'
		 */
		return super.render(owner);
	}
	__hlsLoaded(src) {
		if (!Hls.isSupported())
			return this.notify({type: 'error', code: 5});
		var hls = new Hls();
		hls.loadSource(src);
		hls.attachMedia(this.el);
		//hls.on(Hls.Events.MANIFEST_PARSED, util.bind(this, this.__hlsOnManifestParsed));
		hls.on(Hls.Events.ERROR, util.bind(this, this.__hlsOnError));
		this.hls = hls;
	}
	__hlsOnManifestParsed(event, data){
		//util.console.log('__hlsOnManifestParsed', event, data);
		this.metaDataLoaded = true;
	}
	__hlsOnError(event, data){
		var errorType = data.type;
		var errorDetails = data.details;
		var errorFatal = data.fatal;
		var hls = this.hls;
		//util.console.log('hlsOnError',event , data);
		if(errorFatal){//无法播放且无法恢复播放的错误
			switch(errorType) {
				case Hls.ErrorTypes.NETWORK_ERROR:
					if(errorDetails.indexOf('TimeOut')>0){
						util.console.error("加载视频文件超时");
					}else{
						util.console.error("无法加载视频文件，请检查网络，以及视频文件是否允许跨域请求访问，m3u8文件是否存在 " + (data.response && data.response.status?'netstatus:'+data.response.status:''));
					}
					this.notify({type: 'error', code: 4});
					hls.startLoad();
					break;
				case Hls.ErrorTypes.MEDIA_ERROR:
					//if(errorDetails == Hls.ErrorDetails.BUFFER_APPEND_ERROR){
					//	break;
					//}
					//util.console.error("视频媒体文件解析失败，请检查视频源文件是否可以播放。");
					//this.notify({type: 'error', code: 2});
					hls.recoverMediaError();
					break;
				default:
					// cannot recover
					hls.destroy();
					break;
			}
		}else{//无法播放且有可能恢复播放的错误，hls自动尝试恢复
			//播放中断流会触发 NETWORK_ERROR "levelLoadError"，并且不断重试
		}
	}
	setup() {
		var events = [
			'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error', 'loadedmetadata', 'loadeddata',
			'loadstart', 'pause', 'play', 'playing', 'timeline', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate',
			'volumechange', 'waiting'
		];
		this.playState = States.PlayStates.IDLE;
		this.seekState = States.SeekStates.IDLE;
		this.metaDataLoaded = false;
		this.__timebase = +new Date();
		this.on(PlayerMSG.MetaLoaded, this.notify);
		this.on(PlayerMSG.Loaded, this.notify);
		this.on(PlayerMSG.Progress, this.notify);
		this.on(PlayerMSG.Play, this.notify);
		this.on(PlayerMSG.Playing, this.notify);
		this.on(PlayerMSG.Pause, this.notify);
		this.on(PlayerMSG.Error, this.notify);
		this.on(PlayerMSG.TimeUpdate, this.notify);
		this.on(PlayerMSG.Ended, this.notify);
		this.on(PlayerMSG.Seeking, this.notify);
		this.on(PlayerMSG.Seeked, this.notify);
		this.on(PlayerMSG.VolumeChange, this.notify);
		this.on('durationchange', this.notify);

		this.load(this.options.src, this.options.m3u8 ? util.VideoType.M3U8 : '');
	}
	notify(e) {
		var msg = {type: e.type, src: this, ts: e.timeStamp};

		switch (e.type) {
			case PlayerMSG.MetaLoaded:
				this.__timebase = +new Date() - msg.ts;
				this.metaDataLoaded = true;
				break;
			case PlayerMSG.Error:
				var Props = {1: 'MEDIA_ERR_ABORTED', 2: 'MEDIA_ERR_DECODE', 3: 'MEDIA_ERR_NETWORK', 4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'};
				msg.detail = (this.el && this.el.error) || {code: e.code};
				msg.detail.reason = Props[msg.detail.code];
				//alert('Error'+msg.detail.code); // 移动端断流后不触发error
				break;
			case PlayerMSG.Ended:
				this.pause(); // IE9 不会自动改变播放状态，导致伪全屏的时候出现黑屏
				this.playState = States.PlayStates.STOP;
				break;
			case 'durationchange':
				if (this.videoHeight() != 0)
					msg.type = PlayerMSG.Resize;
				break;
			case PlayerMSG.Playing:
				this.playState = e.type.toUpperCase();
				break;
			case PlayerMSG.Pause:
				this.playState = States.PlayStates.PAUSED;
				break;
			case PlayerMSG.Seeking:
			case PlayerMSG.Seeked:
				this.seekState = e.type.toUpperCase();
				break;
		}
		if(e.type != 'timeupdate'){
			//util.console.log('H5Video notify',e.type, this.playState, this.seekState);
			try{
				lt(e.type);
				for(var key in e){
					lt(key+'|'+e[key]);
				}
				lt('------------------------------------')
			}catch (e){

			}
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
		else this.el.style.width = w;
	}
	height(h) {
		if (!h) return this.el.height;
		else this.el.style.height = h;
	}
	play() {
		this.el.play();
	}
	togglePlay(){
		//util.console.log('togglePlay',this);
		var isM3u8 = this.options.src.indexOf('.m3u8') > -1;
		if(this.options.live && isM3u8 && this.playState == States.PlayStates.IDLE && !this.metaDataLoaded){
			this.player.load();
		}else{
			if(this.paused()){
				this.play();
			}else{
				this.pause();
			}
		}
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
		var canPlayHLS = isM3u8 && this.el.canPlayType('application/x-mpegurl') == 'maybe';
		if (isM3u8 && !canPlayHLS) {
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