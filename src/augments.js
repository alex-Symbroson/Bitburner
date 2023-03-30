
import { AUGS_GANG, getNAug, setNAug } from './constants';
import { fn, fn2 } from './util'
import { task } from './utilTask';

/** @typedef {import('./work').Fac} Fac */
/** @typedef {{name:string,fac:Fac,stats:string[],price:number,rep:number}} Aug */

const AUGS_PREGANG = 3;
const AUGS_POSTGANG = 6;
const AUGS_PREGANG_TOTAL = 9;
const AUGS_POSTGANG_TOTAL = 12;
const AUGS_KILL_PURCHASE = 3;

const AUG_MULT = 1.9;
const NFG_MULT = 1.14;
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
        .map(f => getFaction(ns, f))
        .sort((a, b) => b.rep - a.rep);

    /** @type {{[x:string]:Aug}} */
    const buyAugs = {};
    const allAugs = /** @type {Aug[]} */([]);
    const installedAugs = ns.singularity.getOwnedAugmentations();
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    const purchased = ownedAugs.length - installedAugs.length;
    if (installedAugs.length < 4) setNAug(ns);

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

    const lstAugs = Object.values(buyAugs).sort((a, b) => a.price - b.price);
    let ai = lstAugs.findIndex((a, i, l) => costSum(l.slice(0, i + 1)) > p.money);
    if (ai == -1) ai = lstAugs.length == 0 ? 0 : (costSum(lstAugs) > p.money ? 0 : lstAugs.length);

    const nfgPrice = ns.singularity.getAugmentationPrice(NFG);
    /** @type {(i:number) => Aug} */
    const getNfg = i => ({ ...nfg, name: NFG, price: nfgPrice * (AUG_MULT * NFG_MULT) ** i });
    const lstNfg = new Array(30).fill(0).map((n, i) => getNfg(i));

    const ni = lstNfg.findIndex((a, i, l) => costSum(l.slice(0, i + 1)) > p.money);
    const ani = lstNfg.findIndex((a, i, l) => costSum(l.slice(0, i + 1), ai) > p.money);

    const ags = [0, 1].map(n => costSum(lstAugs.slice(0, ai + n)));
    const ans = [0, 1].map((n, i) => costSum(lstNfg.slice(0, ani + n), ai));
    const ngs = [0, 1].map(n => costSum(lstNfg.slice(0, ni + n)));
    ns.writePort(20, `augs§${getNAug(ns)}:${allAugs.length}§${ai} +${ani} ${fn2(Math.max(...ags, ...ngs), 1)}`);

    if (auto && purchased + ai + ani < 5) return;

    if (!auto)
    {
        if (ns.args.includes('-i'))
        {
            ns.tprint(lstAugs.slice(0, ai + 10).map((a, i) => ns.sprintf(`\n%5s: %8s  (${a.fac.name}) ${"*".slice(Number(i < ai))}${a.name}`, fn2(a.price), a.stats)).join(''));
            ns.tprint(lstNfg.slice(0, ni + 10).map((a, i) => ns.sprintf(`\n%5s: %8s  (${a.fac?.name}) ${"*".slice(Number(i < ni))}${a.name}`, fn2(a.price), a.stats)).join(''));
        }
        ns.tprint(`${ai} Augs ${ags.map(n => fn2(n, 1)).join(' ')}` +
            `    + ${ani} NFG ${ans.map(n => fn2(n, 1)).join(' ')}` +
            `    ${ni} NeuroFlux ${ngs.map(n => fn2(n, 1)).join(' ')}`);
    }

    var tn = 0, nn = 0;
    const hasEnoughAugs = () => purchased + ai >=
        (getNAug(ns) < AUGS_GANG ? AUGS_PREGANG : Math.min(allAugs.length - 8, AUGS_POSTGANG));

    if (ns.args.includes('-p') || ("an".includes(auto) && hasEnoughAugs() && checkInstall(ns, purchased + ai + ani)))
    {
        if (!auto) auto = String(ns.args[1 + ns.args.indexOf('-p')]);

        if (auto != 'n')
            for (const a of lstAugs.slice(0, ai).reverse())
            {
                for (const b of ns.singularity.getAugmentationPrereq(a.name))
                {
                    if (ns.singularity.purchaseAugmentation(a.fac.name, b))
                        ns.tprint("purchased prereq " + b), tn++;
                }
                if (ns.singularity.purchaseAugmentation(a.fac.name, a.name)) tn++;
            }

        if (nfg && auto != 'a')
            for (const a of lstNfg.slice(0, ni))
                if (ns.singularity.purchaseAugmentation(a.fac.name, a.name)) nn++;

        if (tn + nn) ns.tprint(`purchased ${tn} Augs and ${nn} NeuroFlux`);
    }

    if (ns.args.includes('-R') || (auto == "R" && checkInstall(ns)))
    {
        if (auto) ns.tprint("WARN AUTO INSTALL AUGS");
        else ns.tprint("WARN INSTALL AUGS");
        task(ns, "installAugs", ns.args.includes('-R') ? "" : "-d");
    }

    return tn + nn;
}

/** @type {(ns:NS, n?:number) => boolean} */
function checkInstall(ns, n = null)
{
    const no = ns.singularity.getOwnedAugmentations().length;
    if (n === null) n = ns.singularity.getOwnedAugmentations(true).length - no;
    const thres = no < 40 ? AUGS_PREGANG_TOTAL : AUGS_POSTGANG_TOTAL;
    if (n >= thres - AUGS_KILL_PURCHASE) ns.kill('purchase.js', 'home', '-d') && ns.tprint('killed purchase.js');
    return n >= thres;
}

/** @param {Aug[]} list */
function costSum(list, si = 0, exp = AUG_MULT)
{
    return list.reverse()
        .map((e, i) => e.price * exp ** (si + i))
        .reduce((a, b) => a + b, 0);
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
