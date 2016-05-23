import Component from '../Component'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

export default class PlayToggle extends Component {
	constructor(player) {
		super(player, 'PlayToggle', 'button');
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-playtoggle'});

		return super.render(owner);
	}
	setup() {
		this.on('click', this.onClick);
		this.sub('play', this.player.video, util.bind(this, this.handleMsg));
		this.sub('pause', this.player.video, util.bind(this, this.handleMsg));
		// setTimeout(util.bind(this, this.destroy), 1000)
	}
	onClick() {
		var video = this.player.video;
		if (video.paused())
			video.play();
		else
			video.pause();
	}
	handleMsg(msg) {
		console.log(this.__name, msg);
	}
}