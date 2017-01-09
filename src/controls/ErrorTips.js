import Component from '../Component'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

let ErrorCat = {'VideoSourceError': [1002, 4, 2032], 'EnvError':[5], 'NetworkError': [1001, 1, 3], 'VideoDecodeError': [2], 'ArgumentError': [], 'CrossDomainError': [2048]};
let ErrorMap = {
	EnvError: '当前系统环境不支持播放该视频格式',
	VideoSourceError: '获取视频失败，请检查播放链接是否有效',
	NetworkError: '网络错误，请检查网络配置或者播放链接是否正确',
	VideoDecodeError: '视频解码错误',
	ArgumentError: '使用参数有误，请检查播放器调用代码',
	UrlEmpty: '请填写视频播放地址',
	FileProtocol: '请勿在file协议下使用播放器，可能会导致视频无法播放',
	LiveFinish: '直播已结束,请稍后再来', // live 状态由 PLAYING或PAUSE -> STOP
	CrossDomainError: '无法加载视频文件，跨域访问被拒绝'
};

export default class ErrorTips extends Component {
	constructor(player) {
		super(player, 'ErrorTips');
		this.customTips = util.extend({}, ErrorMap, this.options.wording);
		for (let e in ErrorCat) {
			for (let i=0; i<ErrorCat[e].length; i++) {
				let code = ErrorCat[e][i]
				this.customTips[code] = this.customTips[code] || this.customTips[e]
			}
		}
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-error-tips'});

		return super.render(owner);
	}
	setup() {

	}
	handleMsg(msg) {

	}

	/**
	 *
	 * @param {Number|String|Object} detail
	 * @param {Number} detail.code 错误代码
	 * @param {String} detail.reason 错误原因
	 */
	show(detail) {
		this.el.style.display = "block";
		let errstr;
		if (typeof detail === 'string') {
			errstr = detail;
		} else {
			let reason = this.customTips[detail.code] || detail.reason;
			errstr =  '['+detail.code+']' + reason;
		}

		this.el.innerHTML = errstr;
	}
	hide() {
		this.el.style.display = "none";
	}
	clear(){
		this.el.innerHTML = '';
		this.hide();
	}
}