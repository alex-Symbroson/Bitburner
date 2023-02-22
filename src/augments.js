import { fn, fn2 } from './util'

/** @typedef {{name:string,faction:string,price:number}} Aug */

const AUG_MULT = 1.9, NFG_MULT = 1.14, NFG = "NeuroFlux Governor";

/** @param {NS} ns */
export async function main(ns)
{
    const p = ns.getPlayer();
	const fs = p.factions
		.map(name => ({name, rep:ns.singularity.getFactionRep(name)}))
		.sort((a, b) => b.rep - a.rep);

    /** @type {{[x:string]:Aug}} */
	const augs = {};
    const installed = ns.singularity.getOwnedAugmentations(true);
    const exp = installed.length - ns.singularity.getOwnedAugmentations().length;

    for (const f of fs)
	{
		for (const a of ns.singularity.getAugmentationsFromFaction(f.name))
		{
            if (augs[a] || a != NFG && installed.includes(a) || ns.singularity.getAugmentationRepReq(a) > f.rep) continue;

			const s = ns.singularity.getAugmentationStats(a);
			/** @type {(keyof s)[]} */
			const ss = [
                "faction_rep", 
                "hacking", "hacking_exp", "hacking_grow", "hacking_money", "hacking_speed"
            ];
			if (ss.findIndex(k => s[k] > 1) == -1) continue;
			augs[a] = {
				name: a, faction: f.name,
				price: ns.singularity.getAugmentationBasePrice(a) * AUG_MULT ** exp};
		}
	}
    const nfg = augs[NFG];
    delete augs[NFG];

	const lstAugs = Object.values(augs).sort((a, b) => a.price - b.price);
    
    const ai = lstAugs.findIndex((a, i, l) => costSum(l.slice(0, i + 1)) > p.money);

    const nfgPrice = ns.singularity.getAugmentationPrice(NFG);
    /** @type {Aug[]} */
    const lstNfg = new Array(30).fill(0).map((n, i) => ({...nfg, name: NFG, price: nfgPrice * NFG_MULT**i}));
    const ni = lstNfg.findIndex((a, i, l) => costSum(l.slice(0, i + 1)) > p.money);
    const ani = lstNfg.findIndex((a, i, l) => costSum(l.slice(0, i + 1), ai) > p.money);
    
    if (ns.args.includes('-i'))
    {
        ns.tprint(lstAugs.slice(0, ai + 10).map(a => `\n${fn2(a.price)}: ${a.name} (${a.faction})`).join(''));
        ns.tprint(lstNfg.slice(0, ni + 10).map(a => `\n${fn2(a.price)}: ${a.name} (${a.faction})`).join(''));
    }
    const ags = [0,1].map(n => fn2(costSum(lstAugs.slice(0, ai + n)), 1));
    const ans = [0,1].map((n, i) => fn2(costSum(lstNfg.slice(0, ani + n), ai), 1));
    const ngs = [0,1].map(n => fn2(costSum(lstNfg.slice(0, ni + n)), 1));
    ns.tprint(`${ai} Augs ${ags.join(' ')}    + ${ani} NFG ${ans.join(' ')}    ${ni} NeuroFlux ${ngs.join(' ')}`);
    
    if (ns.args.includes('-p'))
    {
        const pi = ns.args.indexOf('-p');

        var tn = 0, nn = 0;
        if (ns.args[pi + 1] != 'n')
            for (const a of lstAugs.slice(0, ai).reverse())
                if (ns.singularity.purchaseAugmentation(a.faction, a.name)) tn++;

        if (ns.args[pi + 1] != 'a')
            for (const a of lstNfg.slice(0, ni))
                if (ns.singularity.purchaseAugmentation(a.faction, a.name)) nn++;

        ns.tprint(`purchased ${tn} Augs and ${nn} NeuroFlux`);
    }

    if (ns.args.includes('-R')) ns.singularity.installAugmentations("autorun.js");
}

/** @param {Aug[]} list */
function costSum(list, si = 0, exp = AUG_MULT)
{
    return list.reverse()
        .map((e, i) => e.price * exp**(si + i))
        .reduce((a, b) => a + b, 0);
}

/** @param {NS} ns 
function getNFGLevel(ns, nPAugs)
{
	const AUG_QUEUE_MULT = AUG_MULT;
    const MULT_BASE = 1.14;
    const NFG = "NeuroFlux Governor";

    // remove effect from already purchased, but uninstalled, augmentations
    var nfgPrice = ns.singularity.getAugmentationPrice(NFG);
    if (nPAugs > 0) {
        // source-file no. 11 changes the modifyer, we account for that here
        let priceMod = Math.pow(AUG_QUEUE_MULT, nPAugs);
        nfgPrice = nfgPrice / priceMod;
    }
    // remove base-price
    var multiplier = nfgPrice / ns.singularity.getAugmentationBasePrice(NFG);
    
    // calculate the level from the multiplier
    var level = log(multiplier, MULT_BASE);
	ns.tprint(level);
} */