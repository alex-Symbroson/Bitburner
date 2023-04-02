
/** @param {NS} ns */
export async function main(ns)
{
    await ns.asleep(1e3);
    ns.run(String(ns.args[0]), Number(ns.args[1]) || 1, ...ns.args.slice(2))
}