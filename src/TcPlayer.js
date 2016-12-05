import * as browser from './browser'
import * as dom from './dom'
import * as util from './util'
import * as Tips from './constant/Tips'

import { Player }  from './Player'

//export var browser = __browser;
//export var util = __util;
//export var dom = __dom;

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
     */
    constructor(container, options) {
        //this.player = new Player(options);
        //options.width = '640';
        //options.height = '480';
        //整理播放地址
        let videoSource = initVideoSource(options);
        //是否启用flash
        let isFlash = browser.IS_MOBILE ? false : true;
        //根据平台和播放优先级获取播放地址
        let src = getUrl(videoSource);
        let _options = {
            owner: container ,
            videoSource : videoSource ,
            src:  src ,
            autoplay: options.autoplay ,
            live : options.live ,
            flash: isFlash,
            poster: options.coverpic,
            //controls: true,
            width: options.width || '100%' ,
            height: options.height || '100%'
        };
        if(validation(_options)){
            super(_options);
        }
        //console.log('constructor',this);
        //return new Player(options);
    }
    /**
     * 切换清晰度
     */
    switchClarity(){

    }
}
/**
 *
 * @param options
 */
function initVideoSource(options){
    let videoSource = {
        is_m3u8: !!options.m3u8 || !!options.m3u8_hd || !!options.m3u8_sd,
        is_flv: !!options.flv || !!options.flv_hd || !!options.flv_sd,
        is_mp4: !!options.mp4 || !!options.mp4_hd || !!options.mp4_sd,
        is_rtmp: !!options.rtmp || !!options.rtmp_hd || !!options.rtmp_sd,
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
        }
    };
    return videoSource;
}
function validation(options){
    let vs = options.videoSource;
    if(!(vs.is_m3u8 || vs.is_flv || vs.is_m3u8 || vs.is_rtmp)){
        //alert(Tips.ERROR.urlEmpty);
        return false;
    }
}
function getClarityUrl(urls, format, definition){
    return urls[format][definition];
}
/**
 *
 * @param format 视频格式
 * @param definitions 清晰度优先级
 */
function getFormatUrl(urls, format, definitions = ['od','hd','sd']){
    //for (let def of definitions.values()) {
    let def = '';
    for (let i=0; i<definitions.length; i++){
        def = definitions[i];
        if(urls[format][def]){
            return urls[format][def];
        }
    }
}
/**
 * 根据平台和播放优先级获取播放地址
 * @param videoSource
 * @param formats
 * @returns {string}
 */
// mobile ：hls>mp4
// PC ：RTMP>flv>hls>mp4
function getUrl(videoSource, formats = {mobile:['m3u8', 'mp4'], pc:['rtmp','flv','m3u8','mp4']} ){
    //区分平台
    let src = "",
        urls = videoSource.urls,
        formatList = browser.IS_MOBILE ? formats.mobile : formats.pc;
    //for (let val of formatList.values()) {
    let fm = '';
    for (let i=0; i<formatList.length; i++){
        fm = formatList[i];
        if(videoSource['is_' + fm]){
            src = getFormatUrl(urls, fm);
            break;
        }
    }
    return src;
}

