var __guid = 1;
export function guid() {
	return __guid++;
}

export function bind(context, fn, uid) {
	if (!fn.guid) fn.guid = guid();

	var ret = function() {fn.apply(context, arguments)};
	// 多实例会共享同一个原型方法，于是乎guid也会一样，所以再加个uid主动做区分
	ret.guid = uid ? uid + '_' + fn.guid : fn.guid;
	return ret;
}

export function isEmpty(obj) {
	if (obj instanceof Array) return obj.length === 0;

	for (let p in obj)
		if (obj.hasOwnProperty(p)) return false;

	return true;
}