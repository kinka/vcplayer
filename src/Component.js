import * as dom from './dom'

export default class Component {
	constructor(name, type, player) {
		this.name = name;
		this.type = type;
		this.player = player;
		console.log(name, type, player.settings);
	}
	createEl(tag, attrs, props) {
		return dom.createEl(tag, attrs, props);
	}
	render(owner) {

	}
}