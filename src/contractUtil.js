
/** @type {<T>(arr:T[], n:number) => T[][]} */
export const selectN = (arr, n) => n == 0 ? [[]] : [].concat(...arr.map(
	(e, i) => selectN(arr.slice(i + 1), n - 1).map(x => [e].concat(x))));

/** @param {string} v @param {string} c */
export const count = (v, c) => v.split(c).length - 1;

/** @type {<T>(arr:T[], v:T) => number[]} */
export const ifilter = (arr, v) => arr.reduce((a, p, i) => p == v ? a.concat(i) : a, [])
