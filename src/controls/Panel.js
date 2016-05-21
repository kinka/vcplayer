import Component from '../Component'
import PlayToggle from './PlayToggle'
import Slider from './Slider'
import * as dom from '../dom'

export default class Panel extends Component {
	constructor(player) {
		super(player, 'Panel', 'panel');
	}
	render(owner) {
		this.createEl('div', {'class': 'vcp-controls-panel'});
		this.el.appendChild(dom.createEl('div', {'class': 'vcp-panel-bg'}));
		this.playToggle = new PlayToggle(this.player);
		this.playToggle.render(this.el);

		this.slider = new Slider(this.player);
		this.slider.render(this.el);
		this.slider.el.style.float = 'left';

		this.volume = new Slider(this.player, true);
		this.volume.render(this.el);

		return super.render(owner);
	}
	setup() {
		// add play toggle, progress, time label, volume/mute, fullscreen
	}
}