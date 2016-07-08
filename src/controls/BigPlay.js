import Component from '../Component'
import * as B from '../browser'

export default class BigPlay extends Component {
	constructor(player) {
		super(player, 'BigPlay');
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-bigplay'});

		return super.render(owner);
	}
	setup() {
		this.on('click', this.onClick);
	}
	onClick() {
		var video = this.player.video;
		if (B.IS_MOBILE && !video.paused()) {
			return this.player.panel && this.player.panel.toggle();
		}

		if (video.paused())
			video.play();
		else
			video.pause();
	}
	handleMsg(msg) {
		console.log('@' + this.name, msg);
	}
}