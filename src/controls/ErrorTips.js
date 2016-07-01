import Component from '../Component'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

export default class ErrorTips extends Component {
	constructor(player) {
		super(player, 'ErrorTips');
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-error-tips'});

		return super.render(owner);
	}
	setup() {

	}
	handleMsg(msg) {

	}
	show(detail) {
		this.el.style.display = "block";
		// todo xss 防护
		var errstr = typeof detail === 'string' ? detail : '['+detail.code+']' + detail.reason;
		this.el.innerHTML = errstr;
	}
	hide() {
		this.el.style.display = "none";
	}
}