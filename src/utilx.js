
/** @type {NS}     */ var ns;
/** @type {string} */ var host;

/** @param {NS} _ns */
export function init(_ns)
{
    ns = _ns
    host = ns.getHostname();
}

/** @param {string} s */
export function msg(s) { ns.tprint(`  ${s}`) }

/** @param {string} s */
export function err(s) { ns.tprint(`  ERROR: ${s}`); }

/** @param {string} s */
export function wrn(s) { ns.tprint(`  WARNING: ${s}`); }
