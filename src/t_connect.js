
/** @param {NS} ns */
export async function main(ns)
{
    ns.singularity.connect(String(ns.args[0]));
}