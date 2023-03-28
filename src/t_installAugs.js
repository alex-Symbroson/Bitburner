import { getNAug, setNAug } from "./constants";

/** @param {NS} ns */
export async function main(ns)
{
    ns.toast("INSTALL AUGS...", "warning", 1e4);
    ns.asleep(1e4);
    setNAug(ns, getNAug(ns) + 1);
    ns.singularity.installAugmentations("autorun.js");
}