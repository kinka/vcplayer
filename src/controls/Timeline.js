import Slider from './Slider'
import Component from '../Component'
import * as dom from '../dom'

/**
 * @method percent
 * @property {Slider} progress
 * @class Timeline
 */
export default class Timeline extends Component {
	constructor(player) {
		super(player, 'Timeline');
	}

	render(owner) {
		this.createEl('div', {'class': 'vcp-timeline'});
		this.progress = new Slider(this.player, false);
		this.progress.render(this.el);

		this.track = this.progress.track;
		return super.render(owner);
	}
	setup() {

	}
	buffered(b) {
		this.track.style.width = b * 100 + '%';
	}
	percent(p) {
		return this.progress.percent(p);
	}
}