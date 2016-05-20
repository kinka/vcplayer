import Component from '../Component'
import PlayToggle from './PlayToggle'

export default class Panel extends Component {
	constructor(player) {
		super(player, 'Panel', 'panel');
	}
	render(owner) {
		this.createEl('div', {'class': 'vcp-controls-panel'});
		this.playToggle = new PlayToggle(this.player);
		this.playToggle.render(this.el);
		return super.render(owner);
	}
	setup() {
		// add play toggle, progress, time label, volume/mute, fullscreen
	}
}