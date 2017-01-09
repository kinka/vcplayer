import * as browser from './browser'
import * as dom from './dom'
import * as util from './util'
import * as message from './message'

//import { Tips }from './constant/Tips'

import { Player }  from './Player'

//export var browser = __browser;
//export var util = __util;
//export var dom = __dom;
let MSG = message.MSG;
//let tips = new Tips();
/**
 *
 */
export class TcPlayer extends Player {
    /**
     *
     * @param container
     * @param options
     *  m3u8 原画url
     *  m3u8_hd 高清url
     *  m3u8_sd 标清url
     *  flv
     *  flv_hd
     *  flv_sd
     *  mp4
     *  mp4_hd
     *  mp4_sd
     *  rtmp
     *  rtmp_hd
     *  rtmp_sd
     *  autoplay 是否自动播放
     *  coverpic 封面图片url
     *  live 是否是直播
     *  clarity 默认清晰度
     *  width auto px %
     *  height auto px %
     *  wording 自定义文案
     *  x5_type
     *  x5_fullscreen
     */
    constructor(container, options) {
        //this.player = new Player(options);
        //整理播放地址
        let videoSource = initVideoSource(options);
        //是否启用flash
        let isFlash = browser.IS_MOBILE ? false : true;
        //根据平台和播放优先级获取播放地址
        let _options = {
            owner: container ,
            videoSource : videoSource ,
            src:  videoSource.curUrl ,
            autoplay: options.autoplay ,
            live : options.live ,
            flash: isFlash,
            poster: options.coverpic,
            //controls: true,
            width: options.width ,
            height: options.height ,
            listener: options.listener,
            wording: options.wording,
            controls: options.controls,
            x5_type: options.x5_type,
            x5_fullscreen: options.x5_fullscreen
        };
        //tips.init(options.wording);
        super(_options);
        validation.call(this, _options);
        //console.log('constructor',this);
        //return new Player(options);
    }
    /**
     * 切换清晰度
     */
    switchClarity(definition){
        definition = definition || 'od';
        let prevTime = this.currentTime(),
            vs = this.options.videoSource,
            result = getDefinitionUrl(vs.urls, definition);
        //console.log('switchClarity',this,result);
        this.load(result.url);
        vs.curUrl = result.url;
        vs.curDef = result.definition;
        vs.curFormat = result.format;
        //console.log('switchClarity', prevTime);
        let fun = util.bind(this, function(){
            //console.log('switchClarity', prevTime, this.duration());
            //console.log('switchClarity', this, prevTime);
            if(parseInt(this.duration() - prevTime) > 0 && !this.options.live){
                this.currentTime(prevTime);
                this.play();
            }
            message.unsub(MSG.MetaLoaded, '*', fun, this);
        });
        message.sub(MSG.MetaLoaded, '*', fun, this);

        /*setTimeout(() => {
            console.log('switchClarity', prevTime);
            this.currentTime(prevTime);
        },2000);*/
    }
    handleMsg(msg) {
        //console.log(msg.type);
        super.handleMsg(msg);
    }
}
/**
 *
 * @param options
 */
function initVideoSource(options){
    let videoSource = {
        urls: {
            m3u8: {
                od: options.m3u8 || '', // Origin Definition
                hd: options.m3u8_hd || '',
                sd: options.m3u8_sd || ''
            },
            flv: {
                od: options.flv || '',
                hd: options.flv_hd || '',
                sd: options.flv_sd || ''
            },
            mp4: {
                od: options.mp4 || '',
                hd: options.mp4_hd || '',
                sd: options.mp4_sd || ''
            },
            rtmp: {
                od: options.rtmp || '',
                hd: options.rtmp_hd || '',
                sd: options.rtmp_sd || ''
            }
        },
        isClarity: function(def){
            let urls = videoSource.urls;
            return !!urls['m3u8'][def] || !!urls['flv'][def] || !!urls['mp4'][def] || !!urls['rtmp'][def];
        },
        isFormat: function(fm){
            let urls = videoSource.urls;
            return !!urls[fm]['od'] || !!urls[fm]['hd'] || !!urls[fm]['sd'];
        }
    };
    videoSource.definitions = [];
    //根据播放环境筛选出可以播放的清晰度
    let definitions = ['od','hd','sd'];

    for (let i=0; i<definitions.length; i++){
        if(videoSource.isClarity(definitions[i])){
            videoSource.definitions.push(definitions[i]);
        }
    }
    let res = getUrlByFormat(videoSource);
    //let res = getUrlByDefinition(videoSource);
    if(res){
        videoSource.curUrl = res.url;
        videoSource.curDef = res.definition;
        videoSource.curFormat = res.format;
    }
    return videoSource;
}
function validation(options){
    let vs = options.videoSource;
    //file协议
    if(browser.IS_FILE_PROTOCOL){
        this.errortips.show({code:'FileProtocol'});
    }
    //没有传url
    if(!(vs.isFormat('rtmp') || vs.isFormat('flv') || vs.isFormat('m3u8') || vs.isFormat('mp4'))){
        //alert(tips.getTips('UrlEmpty'));
        this.errortips.show({code:'UrlEmpty'});
        return false;
    }
    //url 不合法
    //没有flash不支持播放 rtmp 和 flv

    return true;
}
/**
 *  根据清晰度和格式优先级获取播放地址
 * @param urls
 * @param definition
 * @param formats
 * @returns {*}
 */
function getDefinitionUrl(urls, definition, formats){
    let fm = '',
        result;
    if(!formats){
        formats = browser.IS_MOBILE ? ['m3u8', 'mp4'] : ['rtmp','flv','m3u8','mp4'];
    }
    for (let i=0; i<formats.length; i++){
        fm = formats[i];
        if(urls[fm][definition]){
            result={
                definition : definition,
                url: urls[fm][definition],
                format : fm
            };
            break;
        }
    }
    return result;
}
/**
 * 根据格式按清晰度由高到低获取播放地址
 * @param format 视频格式
 * @param definitions 清晰度优先级
 */
function getFormatUrl(urls, format, definitions = ['od','hd','sd']){
    //for (let def of definitions.values()) {
    let def = '';
    for (let i=0; i<definitions.length; i++){
        def = definitions[i];
        if(urls[format][def]){
            return {definition: def, url:urls[format][def]};
        }
    }
}
/**
 * 根据平台和播放格式优先级和清晰度优先级获取播放地址
 * @param videoSource
 * @param formats
 * @returns {string}
 */
// mobile ：hls>mp4
// PC ：RTMP>flv>hls>mp4
function getUrlByFormat(videoSource, formats = {mobile:['m3u8', 'mp4'], pc:['rtmp','flv','m3u8','mp4']} ){
    //区分平台
    let result,
        fm = '',
        urls = videoSource.urls,
        formatList = browser.IS_MOBILE ? formats.mobile : formats.pc;

    for (let i=0; i<formatList.length; i++){
        fm = formatList[i];
        if(videoSource.isFormat(fm)){
            result = getFormatUrl(urls, fm);
            result.format = fm;
            break;
        }
    }

    return result;
}

/**
 * 根据平台和清晰度优先级和播放格式优先级获取播放地址
 * @param videoSource
 * @param formats
 * @param definitions
 * @returns {*}
 */
function getUrlByDefinition(videoSource, formats = {mobile:['m3u8', 'mp4'], pc:['rtmp','flv','m3u8','mp4']}, definitions = ['od','hd','sd']){
    let result,
        def = '',
        urls = videoSource.urls,
        formatList = browser.IS_MOBILE ? formats.mobile : formats.pc;

    for (let i=0; i<definitions.length; i++){
        def = definitions[i];
        if(videoSource.isClarity(def)){
            result = getDefinitionUrl(urls, def, formatList);
            break;
        }
    }
    return result;
}

