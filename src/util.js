var __guid = 1;
export function guid() {
	return __guid++;
}

export function bind(context, fn, uid) {
	if (!fn.guid) fn.guid = guid();

	var ret = function() {fn.apply(context, arguments)};
	ret.guid = fn.guid;
	return ret;
}

export function isEmpty(obj) {
	if (obj instanceof Array) return obj.length === 0;

	for (let p in obj)
		if (obj.hasOwnProperty(p)) return false;

	return true;
}