
/** @param {NS} ns */
export async function main(ns)
{
    ns.run(String(ns.args[0]), Number(ns.args[1]), ...ns.args.slice(2))
}