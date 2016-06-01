import Component from '../Component'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

export default class FullscreenToggle extends Component {
	constructor(player) {
		super(player, 'FullscreenToggle');
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-fullscreen-toggle'});
		window.fsApi = util.FullscreenApi;
		return super.render(owner);
	}
	setup() {
		this.on('click', this.onClick);
	}
	onClick() {
		this.player.fullscreen(!this.player.fullscreen());
	}
	handleMsg(msg) {
		console.log(FullscreenToggle.name, msg);
	}
}