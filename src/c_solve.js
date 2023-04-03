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
	ns.tprint(`INFO solving '${type}' on ${host}/${name}: ${data}`);

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

	if (answer)
	{
		ns.tprint("answer: " + answer);
		task(ns, 'spawn', 'c_answer.js', 1, answer, name, host);
	}
	else ns.tprint("answer was null");
}


/** @type {(n:number)=>number} */
function flpf(n)
{
	let maxf = 1, lim = Math.sqrt(n) | 0;
	if (n % 2 == 0) n /= (maxf = 2);
	for (let f = 3; n > 1 && f < lim; f += 2)
		if (n % f == 0) n /= (maxf = f);
	return n > maxf ? n : maxf;
}


/** @type {(data:any) => any} */
function swms(data)
{

}


/** @type {(data:any) => any} */
function twts(data)
{

}


/** @type {(data:any) => any} */
function twts2(data)
{

}


/** @type {(data:any) => any} */
function sm(data)
{

}


/** @type {(data:any) => any} */
function ajg(data)
{

}


/** @type {(data:any) => any} */
function ajg2(data)
{

}


/** @type {(data:any) => any} */
function moi(data)
{

}


/** @type {(data:any) => any} */
function gipa(data)
{

}


/** @type {(data:any) => any} */
function ast1(data)
{

}


/** @type {(data:any) => any} */
function ast2(data)
{

}


/** @type {(data:any) => any} */
function ast3(data)
{

}


/** @type {(data:any) => any} */
function ast4(data)
{

}


/** @type {(data:any) => any} */
function mpst(data)
{

}


/** @type {(data:any) => any} */
function upg1(data)
{

}


/** @type {(data:any) => any} */
function upg2(data)
{

}


/** @type {(data:any) => any} */
function spg(data)
{

}


/** @type {(data:any) => any} */
function spe(data)
{

}


/** @type {(data:any) => any} */
function fvme(data)
{

}


/** @type {(data:any) => any} */
function hci2b(data)
{

}


/** @type {(data:any) => any} */
function hcb2i(data)
{

}


/** @type {(data:any) => any} */
function p2cg(data)
{

}


/** @type {(data:any) => any} */
function c1rlec(data)
{

}


/** @type {(data:any) => any} */
function c2lzd(data)
{

}


/** @type {(data:any) => any} */
function c3lzc(data)
{

}


/** @type {(data:any) => any} */
function e1cc(data)
{

}


/** @type {(data:any) => any} */
function e2vc(data)
{

}

