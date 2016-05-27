import Slider from './Slider'
import Component from '../Component'
import * as dom from '../dom'

/**
 * @method percent
 * @class Timeline
 */
export default class Timeline extends Component {
	constructor(player) {
		super(player, 'Timeline', 'timeline');
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-timeline'});
		this.slider = new Slider(this.player, false);
		this.slider.render(this.el);

		this.track = this.slider.track;
		return super.render(owner);
	}
	setup() {

	}
	buffered(b) {
		this.track.style.width = b * 100 + '%';
	}
	percent(p) {
		return this.slider.percent(p);
	}
}