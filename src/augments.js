import { fn, fn2 } from './util'
import { task } from './utilTask';

/** @typedef {import('./work').Fac} Fac */
/** @typedef {{name:string,fac:Fac,stats:string[],price:number,rep:number}} Aug */

const AUG_THRES = 12;
const AUG_MULT = 1.9;
const NFG_MULT = 1.9 * 1.14;
const NFG = "NeuroFlux Governor";

/** @type {(keyof import('../Bitburner.t').Multipliers)[]} */
const wantedStats = [
    "faction_rep",
    "hacking", "hacking_exp", "hacking_grow", "hacking_money", "hacking_speed"
];

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
        .map(getFaction.bind(null, ns))
        .sort((a, b) => b.rep - a.rep);

    /** @type {{[x:string]:Aug}} */
    const buyAugs = {};
    /** @type {Aug[]} */
    const allAugs = [];
    const installedAugs = ns.singularity.getOwnedAugmentations();
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    const purchased = ownedAugs.length - installedAugs.length;
    if (installedAugs.length < 4) ns.write("naug.txt", "0", "w");

    for (const f of fs)
    {
        for (const a of ns.singularity.getAugmentationsFromFaction(f.name))
        {
            const aug = getAugmentation(ns, f, a, purchased);
            if (a == NFG || !ownedAugs.includes(a))
            {
                if (allow.includes(a) || aug.stats.length)
                {
                    if (a != NFG) allAugs.push(aug);
                    if (aug.rep <= f.rep) buyAugs[a] = aug;
                }
            }
        }
    }
    const nfg = buyAugs[NFG];
    delete buyAugs[NFG];

    suggestWorkFac(ns, allAugs);
    const lstAugs = Object.values(buyAugs).sort((a, b) => a.price - b.price);

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
            ns.tprint(lstAugs.slice(0, ai + 10).map((a, i) => ns.sprintf(`\n%5s: %8s  (${a.fac.name}) ${"*".slice(Number(i < ai))}${a.name}`, fn2(a.price), a.stats)).join(''));
            ns.tprint(lstNfg.slice(0, ni + 10).map((a, i) => ns.sprintf(`\n%5s: %8s  (${a.fac.name}) ${"*".slice(Number(i < ni))}${a.name}`, fn2(a.price), a.stats)).join(''));
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
                if (ns.singularity.purchaseAugmentation(a.fac.name, a.name)) tn++;
                else break;

        if (auto != 'a')
            for (const a of lstNfg.slice(0, ni))
                if (ns.singularity.purchaseAugmentation(a.fac.name, a.name)) nn++;
                else break;

        sum = tn + nn;
        ns.tprint(`purchased ${tn} Augs and ${nn} NeuroFlux`);
    }

    if (ns.args.includes('-R') || (auto == "R" && checkInstall(ns)))
    {
        if (auto) ns.tprint("WARN AUTO INSTALL AUGS");
        else ns.tprint("WARN INSTALL AUGS");
        task(ns, "installAugs");
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
    return n >= AUG_THRES;
}

/** @param {Aug[]} list */
function costSum(list, si = 0, exp = AUG_MULT)
{
    return list.reverse()
        .map((e, i) => e.price * exp ** (si + i))
        .reduce((a, b) => a + b, 0);
}

/** @type {(ns:NS, lstAugs:Aug[]) => void} */
function suggestWorkFac(ns, allAugs)
{
    allAugs
        .sort((a, b) => a.rep - b.rep)
        .slice(0, AUG_THRES)
        .sort((a, b) =>
        {
            let diffA = a.fac.rep < a.rep ? a.fac.rep - a.rep : Infinity;
            let diffB = b.fac.rep < b.rep ? b.fac.rep - b.rep : Infinity;
            return diffA - diffB;
        });

    /** @type {{[x:string]:Aug[]}} */
    const facs = {};
    for (const a of allAugs)
        facs[a.fac.name] = [...(facs[a.fac.name] || []), a];

    ns.write("workFac.txt", allAugs[0].fac.name, "w");
    // ns.tprint('\n' + allAugs.map(a => `${fn2(a.rep)}:${fn((1 + a.fac.favor / 100))} [${fn2(a.price)}$] ${a.fac.name}:${a.name}`).join('\n'));
    ns.tprint('\n' + Object.entries(facs)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([fname, augs]) => `${fname} ${fn2(augs[0].fac.favor)}:${fn2(augs[0].fac.rep)}` +
            augs.map(a => `\n\t${fn2(a.rep)}-${fn2(a.rep * (1 - 100 / (a.fac.favor + 100)))} ${a.name}`).join(''))
        .join('\n'));
}

/** @type {(ns:NS, name:string) => Fac} */
function getFaction(ns, name)
{
    return {
        name,
        rep: ns.singularity.getFactionRep(name),
        favor: ns.singularity.getFactionFavor(name)
    }
}

/** @type {(ns:NS, fac:Fac, name:string, purchased:number) => Aug} */
function getAugmentation(ns, fac, name, purchased)
{
    const s = ns.singularity.getAugmentationStats(name);
    return {
        name, fac,
        rep: ns.singularity.getAugmentationRepReq(name),
        price: ns.singularity.getAugmentationBasePrice(name) * AUG_MULT ** purchased,
        stats: wantedStats.filter(k => s[k] != 1).map(k => k.split('_').map(k => k[0]).join(''))
    };
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