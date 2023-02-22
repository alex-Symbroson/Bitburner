import { fn2 } from './util'

/** @param {NS} ns */
export async function main(ns)
{
    const p = ns.getPlayer();
	const fs = p.factions;
    /** @type {{[x:string]:number}} */
	const augs = {};
    const installed = ns.singularity.getOwnedAugmentations(true);
    const exp = installed.length - ns.singularity.getOwnedAugmentations().length;

    for (const f of fs)
	{
		for (const a of ns.singularity.getAugmentationsFromFaction(f))
		{
            if (installed.includes(a)) continue;
			const s = ns.singularity.getAugmentationStats(a);
			/** @type {(keyof s)[]} */
			const ss = [
                "faction_rep", 
                "hacking", "hacking_exp", "hacking_grow", "hacking_money", "hacking_speed"
            ];
			if (ss.findIndex(k => s[k] > 1) == -1) continue;
			augs[a] = ns.singularity.getAugmentationBasePrice(a) * 1.9 ** exp;
		}
	}

	const lstAugs = Object.keys(augs).map(name => ({name, price: augs[name]}));
	lstAugs.sort((a, b) => a.price - b.price);
    ns.tprint(lstAugs.map(a => `${fn2(a.price)}: ${a.name}`).join('\n'));
}