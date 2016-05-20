export function on(elem, type, cb) {
	if (!elem) return console.warn('element not exists');
	if (elem.addEventListener)
		elem.addEventListener(type, cb, false);
	else if (elem.attachEvent)
		elem.attachEvent('on' + type, cb);

	return cb;
}
export function off(elem, type, cb) {
	if (!elem) return console.warn('element not exists');
	if (elem.removeEventListener)
		elem.removeEventListener(type, cb, false);
	else if (elem.detachEvent)
		elem.detachEvent('on' + type, cb);
}
export function createEl(tag='div', attrs = {}, props = {}) {
	var el = document.createElement(tag);
	for (let k in attrs) {
		if (!attrs.hasOwnProperty(k)) continue;

		var attr = attrs[k];
		if (attr === null)
			el.removeAttribute(attr);
		else
			el.setAttribute(k, attr);
	}
	for (let k in props) {
		if (!props.hasOwnProperty(k)) continue;

		el[k] = props[k];
	}
	return el;
}
export function get(id) {
	return document.getElementById(id);
}
export function addClass(elem, classToAdd) {
	if (elem.classList)
		elem.classList.add(classToAdd);
	else if (!hasClass(elem, classToAdd))
		elem.className = elem.className + ' ' + classToAdd;
}
export function removeClass(elem, classToRemove) {
	if (elem.classList)
		elem.classList.remove(classToRemove);
	else
		elem.className = elem.className.replace(classRegExp(classToRemove), '');
}
export function hasClass(elem, classToCheck) {
	if (elem.classList)
		return elem.classList.contains(classToCheck);
	else
		return classRegExp(classToCheck).test(elem.className);
}
function classRegExp(className) {
	return new RegExp('(^|\\s)' + className + '($|\\s)');
}