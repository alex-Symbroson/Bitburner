
// @ts-ignore
import { BitBurner as NS } from "Bitburner";
import * as servers from "./servers";

/** @type {NS}     */ var ns;
/** @type {string} */ var host;

/** @param {NS} _ns */
export function init(_ns)
{
    ns = _ns
    host = ns.getHostname();
}
/** @param {string} s */
export function msg(s) { ns.tprint(`  [${host}] ${s}`) }

/** @param {string} s */
export function err(s) { msg(`error: ${s}`); }

export const fn = (i = 0, f = 0, d = 3) => (i * 10 ** (f + d) | 0) / 10 ** (d);