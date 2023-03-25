const fn = (i = 0, f = 0, d = 3) => (i * 10 ** (f + d) | 0) / 10 ** (d);

const logn = (x = 0, b = 10) => Math.log2(x) / Math.log2(b);

function fn2(x = 0, d = 0)
{
	const e = logn(x) / 3 | 0;
	return (fn(x, -3 * e, d) + " kmbtqQsS"[e]).trimEnd();
}
/** @type {<T>(list: T[]) => T} */
export const selectRandom = list => list[Math.random() * list.length | 0];

/** @type {<T>(list: T[], m?: (e:T) => number, invert?: boolean) => T} */
export function selectWeighted(list, m = e => Number(e))
{
	const sum = list.reduce((a, b) => a + m(b), 0);
	var r = sum * Math.random();
	return list.find(s => (r -= m(s)) < 0);
}

/** @type {<T>(list: T[], m?: (e:T) => number, f?: number, base?: number, stepExp?: number) => {e:T, w:number}[]} */
export function closeWeights(list, m = e => Number(e), f = 0, base = 2, stepExp = 10)
{
	const map = list.map(e => ({ e, w: Math.abs(logn(m(e), base) - logn(f, base)) }))
		.filter(e => isFinite(e.w)) // whyy is there a server with 0 RAM ?!

	const max = Math.max.apply(null, map.map(e => e.w))
	for (const e of map) e.w = stepExp ** (max - e.w)
	return map
}

/** @type {(arr: number[]) => number} */
const sum = arr => arr.reduce((a, b) => a + b, 0);

/** @type {(arr: number[]) => number} */
const mean = arr => sum(arr) / arr.length;

class Timer
{
	last = 0;
	diff = 0;

	constructor() { this.last = Date.now(); }
	toString = () => fn(this.diff, -3, 0);

	next()
	{
		this.diff = Date.now() - this.last;
		this.last += this.diff;
		return this;
	}
}

export { fn, sum, mean, logn, fn2, Timer }