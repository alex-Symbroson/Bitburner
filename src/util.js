
const fn = (i = 0, f = 0, d = 3) => (i * 10 ** (f + d) | 0) / 10 ** (d);

const logn = (x = 0, b = 10) => Math.log2(x) / Math.log2(b);

function fn2(x = 0, d = 0)
{
    const e = logn(x)/3|0
    return fn(x, -3*e, d) + " kmbtqQsS"[e]
}

export { fn, logn, fn2 }
