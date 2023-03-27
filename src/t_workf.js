
/** @param {NS} ns */
export async function main(ns)
{
    // @ts-ignore
    ns.singularity.workForFaction(String(ns.args[0]), String(ns.args[1]));
}