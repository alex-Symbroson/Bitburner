import { getNAug, setNAug } from "./constants";

/** @param {NS} ns */
export async function main(ns)
{
    const delay = ns.args.includes('-d') ? 30e3 : 2e3;
    ns.toast("INSTALL AUGS...", "warning", delay);
    await ns.asleep(delay);
    ns.toast("INSTALLED AUGS", "warning", 10e3);
    setNAug(ns, getNAug(ns) + 1);
    ns.singularity.installAugmentations("autorun.js");
}