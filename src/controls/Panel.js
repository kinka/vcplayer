import Component from '../Component'
import PlayToggle from './PlayToggle'
import Slider from './Slider'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

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
		this.slider.percent(0.8);

		this.volume = new Slider(this.player, true);
		this.volume.render(this.el);
		this.volume.percent(0.5);

		message.sub('sliderchange', this.volume, util.bind(this, this.handleMsg));
		message.sub('sliderchange', this.slider, util.bind(this, this.handleMsg));

		return super.render(owner);
	}
	handleMsg(msg) {
		console.log(msg.src.percent());
	}
	setup() {
		// add play toggle, progress, time label, volume/mute, fullscreen
	}
}