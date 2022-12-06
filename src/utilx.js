
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
