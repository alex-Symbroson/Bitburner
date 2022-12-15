
import * as srvd from "./serverData";
import { fn2 } from "./util";

/** @param {NS} ns */
export function init(ns)
{
	srvd.init(ns);
}

/** @param {NS} ns */
export async function main(ns)
{
    init(ns);
    const p = ns.getPlayer()
    const s = srvd.getServer(String(ns.args[0]))

    ns.tprint("H  x1: ", ns.hackAnalyze(s.hostname))
    ns.tprint("H  %c: ", fn2(ns.hackAnalyzeChance(s.hostname), 2))
    ns.tprint("H  1k: S + ", ns.hackAnalyzeSecurity(1000, s.hostname))

    ns.tprint("$ all: ", ns.hackAnalyzeThreads(s.hostname, s.moneyAvailable))
    ns.tprint("$ 0.2: ", ns.hackAnalyzeThreads(s.hostname, s.moneyAvailable - s.moneyMax*0.2))

    if (s.moneyAvailable != s.moneyMax)
    ns.tprint("G all: ", ns.growthAnalyze(s.hostname, s.moneyMax / (s.moneyMax - s.moneyAvailable), 1))
    if (s.moneyAvailable != s.moneyMax*0.9)
    ns.tprint("G 0.9: ", ns.growthAnalyze(s.hostname, s.moneyMax / (s.moneyMax*0.9 - s.moneyAvailable)))
    ns.tprint("G  1k: S +", ns.growthAnalyzeSecurity(1000, s.hostname, 1))

    ns.tprint("W tim: ", ns.getWeakenTime(s.hostname))
    ns.tprint("W tim: ", ns.getHackTime(s.hostname))
    ns.tprint("Multi: ", ns.getHackingMultipliers())
    
    ns.tprint("fG %c: ", ns.formulas.hacking.growPercent(s, 1000, p, 1))
    ns.tprint("fG  t: ", ns.formulas.hacking.growTime(s, p))
    ns.tprint("fH %c: ", ns.formulas.hacking.hackChance(s, p))
    ns.tprint("fH XP: ", ns.formulas.hacking.hackExp(s, p))
    ns.tprint("fH %m: ", ns.formulas.hacking.hackPercent(s, p))
    ns.tprint("fH  t: ", ns.formulas.hacking.hackTime(s, p))
    ns.tprint("fW  t: ", ns.formulas.hacking.weakenTime(s, p))
}

