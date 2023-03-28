
/** @param {NS} ns */
export async function main(ns)
{
    const naug = Number(ns.read('naug.txt'));
    ns.write('naug.txt', String(naug + 1), "w");
    ns.singularity.installAugmentations("autorun.js");
}