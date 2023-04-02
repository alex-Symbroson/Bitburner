
import * as srvd from "./serverData";

/** @type {string[]} */
const tested = [];

/**
 * @typedef Contract
 * @property {string} host
 * @property {string} name
 * @property {string} type
 */

/** @param {NS} ns */
export async function main(ns)
{
    srvd.init(ns);
    for (const f of ns.ls('home', '.cct')) ns.rm(f);

    if (ns.args[0] == '-T')
    {
        ns.codingcontract.createDummyContract(String(ns.args[1]));
        ns.tprint(ns.ls('home', '.cct').join(' '));

        for (const name of ns.ls('home', '.cct'))
        {
            const type = ns.codingcontract.getContractType(name, 'home');
            if (type == ns.args[1]) solve(ns, { host: 'home', name, type });
        }
        return;
    }

    checkNewServers(ns);
}

/** @param {NS} ns */
function checkNewServers(ns)
{
    /** @type {Contract[]} */
    const list = [];
    for (const host of srvd.scanServerNames())
    {
        for (const name of ns.ls(host, '.cct'))
        {
            const type = ns.codingcontract.getContractType(name, host);
            list.push({ host, name, type });
            if (tested.includes(type)) solve(ns, { host, name, type });
        }
    }
    if (list.length) ns.tprint('Found contracts:\n' + list.map(c => `${c.type}: ${c.host}/${c.name}`).sort().join('\n'));
    else ns.tprint('No coding contracts found.');
}

/** @type {(ns:NS, c:Contract) => any} */
function solve(ns, c)
{
    const data = ns.codingcontract.getData(c.name, c.host);
    const rem = ns.codingcontract.getNumTriesRemaining(c.name, c.host);
    ns.tprint(`INFO solving ${c.type} on ${c.host}/${c.name} [${rem}]`);
    ns.tprint('INFO ' + ns.codingcontract.getDescription(c.name, c.host));
    ns.tprint(`INFO data: ${data}`);

    switch (c.type)
    {
        case "Find Largest Prime Factor": return flpf(c, data);
        case "Subarray with Maximum Sum": return swms(c, data);
        case "Total Ways to Sum": return twts(c, data);
        case "Total Ways to Sum II": return twts2(c, data);
        case "Spiralize Matrix": return sm(c, data);
        case "Array Jumping Game": return ajg(c, data);
        case "Array Jumping Game II": return ajg2(c, data);
        case "Merge Overlapping Intervals": return moi(c, data);
        case "Generate IP Addresses": return gipa(c, data);
        case "Algorithmic Stock Trader I": return ast1(c, data);
        case "Algorithmic Stock Trader II": return ast2(c, data);
        case "Algorithmic Stock Trader III": return ast3(c, data);
        case "Algorithmic Stock Trader IV": return ast4(c, data);
        case "Minimum Path Sum in a Triangle": return mpst(c, data);
        case "Unique Paths in a Grid I": return upg1(c, data);
        case "Unique Paths in a Grid II": return upg2(c, data);
        case "Shortest Path in a Grid": return spg(c, data);
        case "Sanitize Parentheses in Expression": return spe(c, data);
        case "Find All Valid Math Expressions": return fvme(c, data);
        case "HammingCodes: Integer to Encoded Binary": return hci2b(c, data);
        case "HammingCodes: Encoded Binary to Integer": return hcb2i(c, data);
        case "Proper 2-Coloring of a Graph": return p2cg(c, data);
        case "Compression I: RLE Compression": return c1rlec(c, data);
        case "Compression II: LZ Decompression": return c2lzd(c, data);
        case "Compression III: LZ Compression": return c3lzc(c, data);
        case "Encryption I: Caesar Cipher": return e1cc(c, data);
        case "Encryption II: Vigenère Cipher": return e2vc(c, data);
        default: return null;
    }
}


/** @type {(c:Contract, data:number) => any} */
function flpf(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function swms(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function twts(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function twts2(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function sm(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function ajg(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function ajg2(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function moi(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function gipa(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function ast1(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function ast2(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function ast3(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function ast4(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function mpst(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function upg1(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function upg2(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function spg(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function spe(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function fvme(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function hci2b(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function hcb2i(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function p2cg(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function c1rlec(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function c2lzd(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function c3lzc(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function e1cc(c, data)
{

}


/** @type {(c:Contract, data:any) => any} */
function e2vc(c, data)
{

}

