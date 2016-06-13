import Component from '../Component'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

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
		// this.sub('play', this.player.video, util.bind(this, this.handleMsg));
		// this.sub('pause', this.player.video, util.bind(this, this.handleMsg));
	}
	onClick() {
		var video = this.player.video;
		if (video.paused())
			video.play();
		else
			video.pause();
	}
	handleMsg(msg) {
		console.log('@' + this.name, msg);
	}
}