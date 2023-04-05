import { count, ifilter, selectN } from "./contractUtil";
import { S } from "./util";
import { task } from "./utilTask";

/**
 * @typedef Contract
 * @property {string} host
 * @property {string} name
 * @property {string} type
 */

/** @param {NS} ns */
export async function main(ns)
{
	solve(ns, String(ns.args[0]), String(ns.args[1]), String(ns.args[2] || 'home'));
}

/** @type {(ns:NS, name:string, type:string, host:string) => any} */
function solve(ns, name, type, host)
{
	const data = ns.codingcontract.getData(name, host);
	if (host != 'home') ns.tprint(`INFO solving '${type}' on ${host}/${name}: ${S(data)}`);

	/** @type {any} */
	let answer;
	switch (type)
	{
		case "Find Largest Prime Factor": answer = flpf(data); break;
		case "Subarray with Maximum Sum": answer = swms(data); break;
		case "Total Ways to Sum": answer = twts(data); break;
		case "Total Ways to Sum II": answer = twts2(data); break;
		case "Spiralize Matrix": answer = sm(data); break;
		case "Array Jumping Game": answer = ajg(data); break;
		case "Array Jumping Game II": answer = ajg2(data); break;
		case "Merge Overlapping Intervals": answer = moi(data); break;
		case "Generate IP Addresses": answer = gipa(data); break;
		case "Algorithmic Stock Trader I": answer = ast1(data); break;
		case "Algorithmic Stock Trader II": answer = ast2(data); break;
		case "Algorithmic Stock Trader III": answer = ast3(data); break;
		case "Algorithmic Stock Trader IV": answer = ast4(data); break;
		case "Minimum Path Sum in a Triangle": answer = mpst(data); break;
		case "Unique Paths in a Grid I": answer = upg1(data); break;
		case "Unique Paths in a Grid II": answer = upg2(data); break;
		case "Shortest Path in a Grid": answer = spg(data); break;
		case "Sanitize Parentheses in Expression": answer = spe(data); break;
		case "Find All Valid Math Expressions": answer = fvme(data); break;
		case "HammingCodes: Integer to Encoded Binary": answer = hci2b(data); break;
		case "HammingCodes: Encoded Binary to Integer": answer = hcb2i(data); break;
		case "Proper 2-Coloring of a Graph": answer = p2cg(data); break;
		case "Compression I: RLE Compression": answer = c1rlec(data); break;
		case "Compression II: LZ Decompression": answer = c2lzd(data); break;
		case "Compression III: LZ Compression": answer = c3lzc(data); break;
		case "Encryption I: Caesar Cipher": answer = e1cc(data); break;
		case "Encryption II: Vigenère Cipher": answer = e2vc(data); break;
		default: answer = null; break;
	}

	if (answer !== null && answer !== undefined && S(answer) !== 'null')
	{
		if (host != 'home') ns.tprint("INFO answer: " + S(answer));
		task(ns, 'spawn', 'c_answer.js', 1, S(answer), name, host, type, S(data));
	}
	else ns.tprint(`ERROR ${ns.args[2] || 'home'}/${name} "${type}": ${S(data)} => ${S(answer)}`);
}


/** @type {(n:number)=>number} */
function flpf(n)
{
	let maxf = 1, lim = Math.sqrt(n) | 0;
	while (n % 2 == 0) n /= (maxf = 2);
	for (let f = 3; n > 1 && f < lim; f += 2)
		if (n % f == 0) n /= (maxf = f), f -= 2;
	return n > maxf ? n : maxf;
}

/** @type {(data:number[]) => number[]} */
function swms(data)
{
	return Math.max.apply(null, data.flatMap((_, a) => data.map(
		(_, b) => b >= a ? data.slice(a, b + 1).reduce((c, d) => c + d) : 0)));
}


/** @type {(data:number) => number} */
function twts(n)
{
	const ways = [1];
	for (let i = 1; i < n; i++)
		for (let j = i; j <= n; j++)
			ways[j] = (ways[j] || 0) + ways[j - i];
	return ways[n];
}


/** @type {(data:[number,number[]]) => any} */
function twts2([n, set])
{
	const ways = [1].concat(new Array(n).fill(0));
	for (let i = 0; i < set.length; i++)
		for (let j = set[i]; j <= n; j++)
			ways[j] = ways[j] + ways[j - set[i]];
	return ways[n];
}


/** @type {(data:number[][]) => any} */
function sm(data)
{
	const w = data[0].length, h = data.length, w1 = w - 1, h1 = h - 1;
	let res = [], n = 0, i = 0;
	let nmax = Math.ceil(Math.min(w / 2, h / 2));

	do
	{
		for (let x = n; x < w1 - n && i++ < w * h; x++)  res.push(data[n][x]);
		for (let y = n; y < h1 - n && i++ < w * h; y++)  res.push(data[y][w1 - n]);
		for (let x = w1 - n; x > n && i++ < w * h; x--)  res.push(data[h1 - n][x]);
		for (let y = h1 - n; y > n && i++ < w * h; y--)  res.push(data[y][n]);
	} while (++n < nmax);
	if (w == h && w % 2) res.push(data[h1 / 2][w1 / 2]);
	return res;
}

/** @type {(data:number[], i?:number) => number} */
function ajg(data, p = 0)
{
	if (p == data.length - 1) return 1;
	if (!data[p]) return 0;
	for (var i = p + 1; i <= p + data[p] && i < data.length; i++)
		if (ajg(data, i)) return 1;
	return 0;
}

/** @type {(data:number[], i?:number, n?:number) => number} */
function ajg2(data, p = 0, n = 0)
{
	if (p == data.length - 1) return n;
	if (!data[p]) return 0;
	return Math.min(...Array.from({ length: data[p] },
		(_, i) => ajg2(data, p + i + 1, n + 1)).filter(Boolean)) | 0;
}


/** @type {(data:number[][]) => number[][]} */
function moi(data)
{
	data.sort((a, b) => a[0] - b[0]);
	return data.sort((a, b) => b[1] - a[1])
		.reduce((r, [a, b]) => r[0][0] <= b ? [[Math.min(a, r[0][0]), r[0][1]]].concat(r.slice(1)) : [[a, b]].concat(r), [data[0]]);
}

// 2500221247, 0814675 : []
/** @type {(data:string, res?:string[]) => string[]} */
function gipa(data, res = [])
{
	if (data.length > 3 * (4 - res.length) ||
		data.length < 4 - res.length)
		return [];
	if (res.length == 4) return [res.join('.')];

	const ret = [];
	for (let i = 1; i <= 3; i++)
	{
		const pt = data.slice(0, i);
		if (i > data.length || Number(pt) > 255) continue;
		ret.push(...gipa(data.slice(i), [...res, pt]));
		if (pt == '0') return ret;
	}
	return ret;
}

/** @type {(data:number[]) => number} */
function ast1(data)
{
	return Math.max(0, ...data.map((v, i) => Math.max(...data.slice(i + 1).map(w => w - v))));
}


/** @type {(data:number[]) => number} */
function ast2(data)
{
	return data.map((v, i) => data[i + 1] - v).reduce((s, a) => a > 0 ? s + a : s, 0);
}


/** @type {(data:any) => any} */
function ast3(data)
{

}


/** @type {(data:any) => any} */
function ast4(data)
{

}


/** @type {(data:number[][]) => any} */
function mpst(data)
{
	for (let i = data.length - 2; i >= 0; i--)
		for (let j = 0; j <= i; j++)
			data[i][j] += Math.min(data[i + 1][j], data[i + 1][j + 1]);
	return data[0][0];
}


/** @type {(data:[number,number]) => number} */
function upg1([w, h])
{
	// permutaions of w-1 R and h-1 D
	let num = (w--, h--, 1);
	for (let i = 1; i <= w; i++)
		num *= (h + i) / i;
	return num;
}

/** @type {(data:number[][]) => number} */
function upg2(data)
{
	for (let i = 0; i < data.length; i++)
	{
		for (let j = 0; j < data[0].length; j++)
		{
			if (data[i][j] == 1) data[i][j] = 0;
			else if (i == 0 && j == 0) data[0][0] = 1;
			else
				data[i][j] = (i > 0 ? data[i - 1][j] : 0) + (j > 0 ? data[i][j - 1] : 0);
		}
	}
	return data[data.length - 1][data[0].length - 1]
}

/** @type {(data:number[][]) => string} */
function spg(data)
{
	const ROW = data.length, COL = data[0].length, dirs = "DURL";
	/** @type {[number,number,string][]} */
	const q = [[0, 0, ""]], visited = new Set([0]);

	while (q.length)
	{
		const [x, y, path] = q.shift();
		if (x == ROW - 1 && y == COL - 1) return path;
		for (let i = 0; i < 4; i++)
		{
			const [nx, ny] = [x + [1, -1][i] || 0, y + [1, -1][i - 2] || 0];
			if (nx >= 0 && nx < ROW && ny >= 0 && ny < COL && data[nx][ny] === 0 && !visited.has(nx * 1e5 + ny))
			{
				visited.add(nx * 1e5 + ny);
				q.push([nx, ny, path + dirs[i]]);
			}
		}
	}
	return "";
}

// TODO: preserve letters all wrong
/** @type {(data:string) => string[]} */
function spe(data)
{
	/** @param {string[]} v */
	const valid = v => v.reduce((z, a) => z < 0 ? 1e5 : z += { '(': 1, ')': -1 }[a] || 0, 0) == 0;

	const leftC = count(data, '('), rightC = count(data, ')'), max = Math.min(leftC, rightC);
	const pars = data.split(''), lefts = ifilter(pars, '('), rights = ifilter(pars, ')');

	for (let i = max; i; i--)
	{
		let res = [];
		for (const ls of selectN(lefts, leftC - i))
			for (const rs of selectN(rights, rightC - i))
			{
				/** @type {{[x:string]: number[]}} */
				const idx = { '(': ls, ')': rs };
				res.push(pars.filter((c, i) => !idx[c]?.includes(i)));
			}
		res = res.filter(valid);
		if (res.length) return [...new Set(res.map(l => l.join('')))];
	}
	return [data.replace(/[()]/g, '')].filter(Boolean);
}


/** @type {(data:[string,number],path?:string,pos?: number, evaluated?: number, multed?: number) => string[]} */
function fvme([num, target], path = "", pos = 0, evaluated = 0, multed = 0)
{
	if (pos == num.length) return target == evaluated ? [path] : [];

	let result = /** @type {string[]} */ ([]);
	for (let i = pos; i < num.length; ++i)
	{
		if (i !== pos && num[pos] == "0") break;
		const cur = Number(num.slice(pos, i + 1));

		if (pos == 0)
			result = result.concat(fvme([num, target], "" + cur, i + 1, cur, cur));
		else
			result = result.concat(
				fvme([num, target], path + "+" + cur, i + 1, evaluated + cur, cur),
				fvme([num, target], path + "-" + cur, i + 1, evaluated - cur, -cur),
				fvme([num, target], path + "*" + cur, i + 1, evaluated - multed + multed * cur, multed * cur));
	}
	return result;
}

// 4812415 wrong "10010001000101100111001111111"
// 130 wrong "0001000000010"
// 20646958935057 wrong "0001000100110001011001111101010001110010110000010001"
/** @type {(data:number) => any} */
function hci2b(n)
{
	const enc = [0], bits = n.toString(2).split('').map(Number);
	for (let i = 1, k = 0; k < bits.length; i++)
		enc[i] = i & (i - 1) ? bits[k++] : 0;  // 0 if pow2 else bit

	const parity = enc.reduce((a, b, i) => b ? a ^ i : a, 0);
	for (let i = 0; 1 << i < parity; i++)
		enc[1 << i] = (parity >> i) & 1;

	enc[0] = enc.reduce((a, b) => a ^ b);
	return enc.join("");
}

/** @type {(data:number) => any} */
function hcb2i(n)
{

}


/** @type {(data:any) => any} */
function p2cg(data)
{

}


/** @type {(data:string) => string} */
function c1rlec(data)
{
	return data.replace(/(.)\1{0,8}/g, (m, c) => m.length + c);
}


/** @type {(data:any) => any} */
function c2lzd(data)
{

}


/** @type {(data:any) => any} */
function c3lzc(data)
{

}


/** @type {(data:[string,number]) => string} */
function e1cc([str, shift])
{
	const dec = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	return str.replace(/[a-z]/gi, c => dec[(dec.indexOf(c) + 26 - shift) % 26]);
}


/** @type {(data:[string,string]) => string} */
function e2vc([str, key])
{
	const dec = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	return str.replace(/[a-z]/gi, (c, i) => dec[(dec.indexOf(c) + dec.indexOf(key[i % key.length])) % 26]);
}

