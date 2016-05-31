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

export function covertTime(s) {
	s = s | 0;
	var h = 3600, m = 60;
	var hours = (s / h) | 0;
	var minutes = ( s - hours * h ) / m | 0; // 有个向下取整的效果
	var sec = s - hours * h - minutes * m;

	hours = hours > 0 ? (hours + ':') : '';
	minutes = minutes > 0 ? (minutes + ':') : (hours > 0 ? '00:' : '');
	sec = sec > 0 ? (sec + '') : '00';

	hours = hours.length == 2 ? ('0' + hours) : hours;
	minutes = minutes.length == 2 ? ('0' + minutes) : minutes;
	sec = sec.length == 1 ? ('0' + sec) : sec;

	return hours + minutes + sec
}