import Component from '../Component'
import * as dom from '../dom'
import * as message from '../message'
import * as util from '../util'

export default class Slider extends Component {
	constructor(player, vertical) {
		super(player, 'Slider', 'slider');
		this.vertical = vertical || false;
	}

	render(owner) {
		var sliderClass = this.vertical ? 'vcp-slider-vertical' : 'vcp-slider';
		this.createEl('div', {'class': sliderClass});
		this.track = dom.createEl('div', {'class': 'vcp-slider-track'});
		this.thumb = dom.createEl('div', {'class': 'vcp-slider-thumb'});
		this.el.appendChild(this.track);
		this.el.appendChild(this.thumb);
		return super.render(owner);
	}
	setup() {
		this.on('mousedown', this.mousedown);
		this.on('mouseup', this.mouseup);

		this.on('mouseout', this.mouseup);
	}
	handleMsg(msg) {
		
	}
	mousedown(e) {
		var target = e.target || e.srcElement;
		this.mousemove(e);
		this.on('mousemove', this.mousemove);
	}
	mouseup(e) {
		var target = e.target || e.srcElement;
		if (e.type == 'mouseout' && [this.el, this.thumb, this.track].indexOf(e.toElement) > -1) return;
		// console.log(e.type, target.className, e.toElement.className, this);
		this.off('mousemove', this.mousemove);
	}
	mousemove(e) {
		var percent = 0;
		if (this.vertical) {
			var offsetY = e.clientY - this.el.offsetTop;
			percent = Math.round(offsetY / this.el.offsetHeight * 1000) / 10;console.log(e.clientY, this.el.offsetTop)
			if (percent <= 0 || percent >= 100) return;
			this.thumb.style.top = (100 - percent) + '%';
		}
		else {
			var offsetX = e.clientX - this.el.offsetLeft;
			percent = Math.round(offsetX / this.el.offsetWidth * 1000) / 10;
			if (percent <= 0 || percent >= 100) return;
			this.thumb.style.left = percent + '%';
		}
	}
}