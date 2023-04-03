
import { task } from "./utilTask";
import { scanServerNames } from "./util_ssn";

/**
 * @typedef Contract
 * @property {string} host
 * @property {string} name
 * @property {string} type
 */

/** @type {string[]} */
const tested = [];

/** @param {NS} ns */
export async function main(ns)
{
    while (true)
    {
        checkNewServers(ns);
        if (!ns.args.includes('-d')) break;
        await ns.asleep(60e3);
    }
}

/** @param {NS} ns */
function checkNewServers(ns)
{
    /** @type {Contract[]} */
    const list = [];
    for (const host of scanServerNames(ns))
    {
        for (const name of ns.ls(host, '.cct'))
        {
            const type = ns.codingcontract.getContractType(name, host);
            list.push({ host, name, type });
            if (tested.includes(type)) task(ns, 'spawn', 'c_solve', 1, name, type, host);
        }
    }
    if (list.length) ns.tprint('Found contracts:\n' + list.map(c => `${c.type}: ${c.host}/${c.name}`).sort().join('\n'));
    else ns.tprint('No coding contracts found.');
}