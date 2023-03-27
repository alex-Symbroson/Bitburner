
/** @param {NS} ns */
export async function main(ns)
{
    ns.singularity.createProgram(String(ns.args[0]));
}