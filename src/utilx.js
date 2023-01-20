
/** @type {NS}     */ var ns;
/** @type {string} */ var host;

/** @param {NS} _ns */
export function init(_ns)
{
    ns = _ns
    host = ns.getHostname();
}

/** @type {(file:string, data:any) => void} */
export const save = (file, data) => { ns.write(file, '_=' + JSON.stringify(data, null, "  "), "w") }

/** @type {(file:string) => any} ns */
export const load = (file) => JSON.parse(String(ns.read(file)).replace(/^.=/, ''))
