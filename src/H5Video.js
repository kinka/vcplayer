import Component from './Component'
import * as dom from './dom'

export default class H5Video extends Component {
	constructor(player) {
		super('H5Video', 'video', player);
	}
	render(owner) {
		var sets = this.player.settings;
		var video = this.createEl('video',
			{controls: null, preload: 'auto', poster: sets.poster, autoplay: sets.autoplay ? true : null},
			{src: sets.src});
		dom.on(video, 'click', function() {
			console.log(this.currentTime)
		});
		owner.appendChild(video);
	}
}