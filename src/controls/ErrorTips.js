import Component from '../Component'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

let ErrorCat = {'VideoSourceError': [1001, 1002, 4], 'NetworkError': [2048, 1, 3], 'VideoDecodeError': [2], 'ArgumentError': []}
let ErrorMap = {
	VideoSourceError: '视频源错误，请检查播放链接是否有效',
	NetworkError: '网络错误，请检查网络配置或者播放链接是否正确',
	VideoDecodeError: '视频解码错误',
	ArgumentError: '使用参数有误，请检查播放器调用代码',
}

export default class ErrorTips extends Component {
	constructor(player) {
		super(player, 'ErrorTips');
		this.customTips = Object.assign({}, ErrorMap, this.options.wording)
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
}