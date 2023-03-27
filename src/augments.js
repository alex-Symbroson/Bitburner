import { fn, fn2 } from './util'

/** @typedef {{name:string,faction:string,stats:string[],price:number}} Aug */

const AUG_MULT = 1.9, NFG_MULT = 1.9 * 1.14, NFG = "NeuroFlux Governor";

/** @param {NS} ns */
export async function main(ns)
{
    if (!ns.args.includes('-c')) check(ns);

    if (ns.args.includes('-c'))
    {
        for (let i = 0; i < 5; i++) if (!check(ns, 'a')) break;
        for (let i = 0; i < 5; i++) if (!check(ns, 'n')) break;
        check(ns, 'R');
    }
    else if (ns.args.includes('-d'))
    {
        while (true)
        {
            ns.asleep(10000);
            check(ns, '*');
        }
    }
}

/** @type {(ns:NS, auto?:string) => number} */
function check(ns, auto = null)
{
    const allow = [NFG, "Neuroreceptor Management Implant", "The Red Pill"]
    const p = ns.getPlayer();
    const fs = p.factions
        .map(name => ({ name, rep: ns.singularity.getFactionRep(name) }))
        .sort((a, b) => b.rep - a.rep);

    /** @type {{[x:string]:Aug}} */
    const augs = {};
    const installedAugs = ns.singularity.getOwnedAugmentations();
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    const purchased = ownedAugs.length - installedAugs.length;
    if (installedAugs.length == 0) ns.write("naug.txt", "0", "w");

    for (const f of fs)
    {
        for (const a of ns.singularity.getAugmentationsFromFaction(f.name))
        {
            if (a != NFG && ownedAugs.includes(a) || ns.singularity.getAugmentationRepReq(a) > f.rep) continue;

            const s = ns.singularity.getAugmentationStats(a);
            /** @type {(keyof s)[]} */
            const ss = [
                "faction_rep",
                "hacking", "hacking_exp", "hacking_grow", "hacking_money", "hacking_speed"
            ];
            if (!allow.includes(a) && ss.findIndex(k => s[k] != 1) == -1) continue;
            augs[a] = {
                name: a, faction: f.name,
                stats: ss.filter(k => s[k] != 1).map(k => k.split('_').map(k => k[0]).join('')),
                price: ns.singularity.getAugmentationBasePrice(a) * AUG_MULT ** purchased
            };
        }
    }
    const nfg = augs[NFG];
    delete augs[NFG];

    const lstAugs = Object.values(augs).sort((a, b) => a.price - b.price);

    let ai = lstAugs.findIndex((a, i, l) => costSum(l.slice(0, i + 1)) > p.money);
    if (ai == -1) ai = lstAugs.length == 0 ? 0 : (costSum(lstAugs) > p.money ? 0 : lstAugs.length);

    const nfgPrice = ns.singularity.getAugmentationPrice(NFG);
    /** @type {Aug[]} */
    const lstNfg = new Array(30).fill(0).map((n, i) => ({ ...nfg, name: NFG, price: nfgPrice * NFG_MULT ** i }));
    const ni = lstNfg.findIndex((a, i, l) => costSum(l.slice(0, i + 1)) > p.money);
    const ani = lstNfg.findIndex((a, i, l) => costSum(l.slice(0, i + 1), ai) > p.money);

    if (auto && purchased + ai + ani < 5) return;

    if (true || !auto)
    {
        if (ns.args.includes('-i'))
        {
            ns.tprint(lstAugs.slice(0, ai + 10).map((a, i) => ns.sprintf(`\n%5s: %8s  (${a.faction}) ${"*".slice(Number(i < ai))}${a.name}`, fn2(a.price), a.stats)).join(''));
            ns.tprint(lstNfg.slice(0, ni + 10).map((a, i) => ns.sprintf(`\n%5s: %8s  (${a.faction}) ${"*".slice(Number(i < ni))}${a.name}`, fn2(a.price), a.stats)).join(''));
        }
        const ags = [0, 1].map(n => fn2(costSum(lstAugs.slice(0, ai + n)), 1));
        const ans = [0, 1].map((n, i) => fn2(costSum(lstNfg.slice(0, ani + n), ai), 1));
        const ngs = [0, 1].map(n => fn2(costSum(lstNfg.slice(0, ni + n)), 1));
        ns.tprint(`${ai} Augs ${ags.join(' ')}    + ${ani} NFG ${ans.join(' ')}    ${ni} NeuroFlux ${ngs.join(' ')}`);
    }

    var sum = 0;
    if (ns.args.includes('-p') || ("an".includes(auto) && checkInstall(ns, purchased + ai + ani)))
    {
        if (!auto) auto = String(ns.args[1 + ns.args.indexOf('-p')]);

        var tn = 0, nn = 0;
        if (auto != 'n')
            for (const a of lstAugs.slice(0, ai).reverse())
                if (ns.singularity.purchaseAugmentation(a.faction, a.name)) tn++;
                else break;

        if (auto != 'a')
            for (const a of lstNfg.slice(0, ni))
                if (ns.singularity.purchaseAugmentation(a.faction, a.name)) nn++;
                else break;

        sum = tn + nn;
        ns.tprint(`purchased ${tn} Augs and ${nn} NeuroFlux`);
    }

    if (ns.args.includes('-R') || (auto == "R" && checkInstall(ns)))
    {
        if (auto) ns.tprint("WARN AUTO INSTALL AUGS");
        else ns.tprint("WARN INSTALL AUGS");
        const naug = Number(ns.read('naug.txt'));
        ns.write('naug.txt', String(naug + 1), "w");
        ns.singularity.installAugmentations("autorun.js");
    }

    return sum;
}

/** @type {(ns:NS, n?:number) => boolean} */
function checkInstall(ns, n = null)
{
    const no = ns.singularity.getOwnedAugmentations().length;
    if (n === null) n = ns.singularity.getOwnedAugmentations(true).length - no;
    ns.tprint("checki: " + n);
    if (no < 40) return n >= 9;
    return n >= 12;
}

/** @param {Aug[]} list */
function costSum(list, si = 0, exp = AUG_MULT)
{
    return list.reverse()
        .map((e, i) => e.price * exp ** (si + i))
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