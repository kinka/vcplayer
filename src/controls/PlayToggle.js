import Component from '../Component'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'
import * as States from '../constant/States.js'

export default class PlayToggle extends Component {
	constructor(player) {
		super(player, 'PlayToggle');
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-playtoggle'});
		return super.render(owner);
	}
	setup() {
		this.on('click', this.onClick);
		// this.sub('play', this.player.video, util.bind(this, this.handleMsg));
		// this.sub('pause', this.player.video, util.bind(this, this.handleMsg));
	}
	onClick() {
		this.player.togglePlay();

		/*var video = this.player.video;
		util.console.log('onclick', video.playState);
		if( video.playState == States.PlayStates.PLAYING){
			this.player.pause();
		} else {
			this.player.play();
		}*/

	}
	handleMsg(msg) {
		console.log('@' + this.name, msg);
	}
}