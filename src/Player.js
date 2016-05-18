import * as browser from './browser'
import * as dom from './dom'
import H5Video from './H5Video'

export class Player {
	constructor(settings) {
		this.settings = settings;
		var owner = settings.owner;
		if (!owner) return console.error('Player need a container');
		owner = dom.get(owner);
		var h5 = new H5Video(this);
		h5.render(owner);
	}
}