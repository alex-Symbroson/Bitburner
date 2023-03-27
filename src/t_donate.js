
/** @param {NS} ns */
export async function main(ns)
{
    ns.singularity.donateToFaction(String(ns.args[0]), Number(ns.args[1]));
}