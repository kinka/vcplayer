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
		this.sub(SliderMSG.Changing, this.progress, util.bind(this, this.handleMsg));
		this.sub(SliderMSG.Changed, this.progress, util.bind(this, this.handleMsg));
	}
	handleMsg(msg) {
		if (msg.type === SliderMSG.Changing) {
			this.scrubbing = true;
			this.syncLabel(this.percent());
		} else if (msg.type === SliderMSG.Changed) {
			this.scrubbing = false;
		}
	}
	syncLabel(p) { // 保持与进度条一致
		var d = this.player.duration();
		p = Math.min(p, 1);
		var time = '';
		if (d)
			time = util.covertTime(p*d) + '/' + util.covertTime(d);
		this.pub({type: 'timelabel', src: 'timeline', label: time, private: true});
	}

	buffered(b) {
		b = Math.min(b, 1);
		this.track.style.width = b * 100 + '%';
	}
	percent(p) {
		if (typeof p === 'undefined') return this.progress.percent() || 0;
		p = Math.min(p, 1); // flash m3u8 返回的duration不大对，但是进度条要保证不溢出
		this.syncLabel(p);
		return this.progress.percent(p);
	}
}