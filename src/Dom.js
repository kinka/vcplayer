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
		elem.className = elem.className.replace(classRegExp(classToRemove), ' ');
}
export function toggleClass(elem, classToToggle, assert) {
	assert ? addClass(elem, classToToggle) : removeClass(elem, classToToggle);
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
/**
 * Offset Left
 * getBoundingClientRect technique from
 * John Resig http://ejohn.org/blog/getboundingclientrect-is-awesome/
 *
 * @function findElPosition
 * @param {Element} el Element from which to get offset
 * @return {Object}
 */
export function findElPosition(el) {
	let box;

	if (el.getBoundingClientRect && el.parentNode) {
		box = el.getBoundingClientRect();
	}

	if (!box) {
		return {
			left: 0,
			top: 0
		};
	}

	const docEl = document.documentElement;
	const body = document.body;

	const clientLeft = docEl.clientLeft || body.clientLeft || 0;
	const scrollLeft = window.pageXOffset || body.scrollLeft;
	const left = box.left + scrollLeft - clientLeft;

	const clientTop = docEl.clientTop || body.clientTop || 0;
	const scrollTop = window.pageYOffset || body.scrollTop;
	const top = box.top + scrollTop - clientTop;

	// Android sometimes returns slightly off decimal values, so need to round
	return {
		left: Math.round(left),
		top: Math.round(top)
	};
}
/**
 * Get pointer position in element
 * Returns an object with x and y coordinates.
 * The base on the coordinates are the bottom left of the element.
 *
 * @function getPointerPosition
 * @param {Element} el Element on which to get the pointer position on
 * @param {Event} event Event object
 * @return {Object} This object will have x and y coordinates corresponding to the mouse position
 */
export function getPointerPosition(el, event, pos) {
	let position = {};
	let box = pos || findElPosition(el);
	let boxW = el.offsetWidth;
	let boxH = el.offsetHeight;

	let boxY = box.top;
	let boxX = box.left;
	let pageY = event.pageY;
	let pageX = event.pageX;

	if (event.changedTouches) {
		pageX = event.changedTouches[0].pageX;
		pageY = event.changedTouches[0].pageY;
	}

	position.y = Math.max(0, Math.min(1, ((boxY - pageY) + boxH) / boxH));
	position.x = Math.max(0, Math.min(1, (pageX - boxX) / boxW));

	return position;
}
