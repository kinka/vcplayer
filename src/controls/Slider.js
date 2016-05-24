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
		this.ownerDoc = document.body.ownerDocument;
		this.on('mousedown', this.mousedown);

		// this.on('mouseout', this.mouseup);
	}
	handleMsg(msg) {
		
	}
	mousedown(e) {
		e.preventDefault(); // 没加上这一句，就会偶尔出现拖动不了的情况，并且指针变成文字输入光标

		this.pos = dom.findElPosition(this.el);

		this.on(this.ownerDoc, 'mouseup', this.mouseup);
		this.on(this.ownerDoc, 'mousemove', this.mousemove);

		this.mousemove(e);
		return false;
	}
	mouseup(e) {
		var target = e.target || e.srcElement;
		// console.log(e.type, target.className, e.toElement.className, this);
		this.off(this.ownerDoc, 'mouseup', this.mouseup);
		this.off(this.ownerDoc, 'mousemove', this.mousemove);
	}
	mousemove(e) {
		var pos = dom.getPointerPosition(this.el, e, this.pos);
		if (this.vertical) {
			this.__percent = 100 - Math.round(pos.y * 1000) / 10;
			this.thumb.style.top = this.__percent + '%';
		} else {
			this.__percent = Math.round(pos.x * 1000) / 10;
			this.thumb.style.left = this.__percent + '%';
		}
		this.pub({type: 'sliderchange', src: this, private: true});
	}
	percent(p) {
		if (!p) return this.__percent;

		this.__percent = Math.round(parseFloat(p) * 1000) / 10;
		if (this.vertical)
			this.thumb.style.top = this.__percent + '%';
		else
			this.thumb.style.left = this.__percent + '%';
	}
}