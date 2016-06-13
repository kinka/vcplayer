import Slider, {MSG as SliderMSG} from './Slider'
import Component from '../Component'
import * as dom from '../dom'
import * as util from '../util'

/**
 * @method percent
 * @property {Slider} progress
 * @property {Boolean} scrubbing
 * @class Timeline
 */
export default class Timelabel extends Component {
	constructor(player) {
		super(player, 'Timelabel');
	}

	render(owner) {
		this.createEl('span', {'class': 'vcp-timelabel'});

		return super.render(owner);
	}
	setup() {
		this.sub('timelabel', 'timeline', util.bind(this, this.handleMsg));
	}
	handleMsg(msg) {
		this.el.innerHTML = msg.label;
	}
}