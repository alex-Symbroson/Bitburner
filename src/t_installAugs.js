import { getNAug, setNAug } from "./constants";

/** @param {NS} ns */
export async function main(ns)
{
    ns.toast("INSTALL AUGS...", "warning", 30e3);
    await ns.asleep(ns.args.includes('-d') ? 30e3 : 2e3);
    ns.toast("INSTALLED AUGS", "warning", 5e3);
    setNAug(ns, getNAug(ns) + 1);
    ns.singularity.installAugmentations("autorun.js");
}