export function on(elem, type, cb) {
	if (elem.addEventListener)
		elem.addEventListener(type, cb, false);
	else if (elem.attachEvent)
		elem.attachEvent('on' + type, cb);

	return cb;
}
export function off(elem, type, cb) {
	if (elem.removeEventListener)
		elem.removeEventListener(type, cb, false);
	else if (elem.detachEvent)
		elem.detachEvent('on' + type, cb);
}
export function createEl(tag='div', attrs = {}, props = {}) {
	var el = document.createElement(tag);
	for (let k in attrs) {
		var attr = attrs[k];
		if (attr === null)
			el.removeAttribute(attr);
		else
			el.setAttribute(k, attr);
	}
	for (let k in props) {
		el[k] = props[k];
	}
	return el;
}
export function get(id) {
	return document.getElementById(id);
}