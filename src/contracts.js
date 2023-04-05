
import { task } from "./utilTask";
import { scanServerNames } from "./util_ssn";

/**
 * @typedef Contract
 * @property {string} host
 * @property {string} name
 * @property {string} type
 */

const tested = [
    "Find Largest Prime Factor",
    "Subarray with Maximum Sum",
    "Total Ways to Sum",
    "Total Ways to Sum II",
    "Spiralize Matrix",
    "Array Jumping Game",
    "Array Jumping Game II",
    "Merge Overlapping Intervals",
    "Generate IP Addresses",
    "Algorithmic Stock Trader I",
    "Algorithmic Stock Trader II",
    // "Algorithmic Stock Trader III",
    // "Algorithmic Stock Trader IV",
    "Minimum Path Sum in a Triangle",
    "Unique Paths in a Grid I",
    "Unique Paths in a Grid II",
    // "Shortest Path in a Grid", // -
    "Sanitize Parentheses in Expression",
    "Find All Valid Math Expressions",
    "HammingCodes: Integer to Encoded Binary", // -
    // "HammingCodes: Encoded Binary to Integer",
    // "Proper 2-Coloring of a Graph",
    "Compression I: RLE Compression",
    // "Compression II: LZ Decompression",
    // "Compression III: LZ Compression",
    "Encryption I: Caesar Cipher",
    "Encryption II: Vigenère Cipher",
];

/** @param {NS} ns */
export async function main(ns)
{
    while (true)
    {
        await checkNewServers(ns);
        if (!ns.args.includes('-d')) break;
        await ns.asleep(60e3);
    }
}

/** @param {NS} ns */
async function checkNewServers(ns)
{
    /** @type {Contract[]} */
    const list = [];
    for (const host of scanServerNames(ns))
    {
        for (const name of ns.ls(host, '.cct'))
        {
            const type = ns.codingcontract.getContractType(name, host);
            list.push({ host, name, type });
            if (host == 'home' || tested.includes(type))
                task(ns, 'spawn', 'c_solve.js', 1, name, type, host);
        }
    }
    if (list.length) ns.tprint('Found contracts:\n' + list.map(c => `${c.type}: ${c.host}/${c.name}`).sort().join('\n'));
    else ns.tprint('No coding contracts found.');
}