/** @param {NS} ns */
export async function main(ns)
{
    const SOURCE_F_11_MOD = [1, 0.96, 0.94, 0.93];
    const AUG_QUEUE_MULT = 1.9;  // CONSTANTS.MultipleAugMultiplier
    const MULT_BASE = 1.14;  // CONSTANTS.NeuroFluxGovernorLevelMult
    const NFG = "NeuroFlux Governor";

    // remove effect from already purchased, but uninstalled, augmentations
    var nfgPrice = ns.singularity.getAugmentationPrice(NFG);
    var nofUninstAugs = nofUninstalledAugs(ns);
    if (nofUninstAugs > 0) {
        // source-file no. 11 changes the modifyer, we account for that here
        let priceMod = Math.pow(AUG_QUEUE_MULT * SOURCE_F_11_MOD[getSourceFileLevel(ns, 11)], nofUninstAugs);
        nfgPrice = nfgPrice / priceMod;
    }
    // remove base-price
    var multiplier = nfgPrice / ns.singularity.getAugmentationBasePrice(NFG);
    if (getSourceFileLevel(ns, 5) > 0 || ns.getPlayer().bitNodeN == 5)
        // remove bitnode-multiplier (this requires source-file no. 5)
        multiplier = multiplier / ns.getBitNodeMultipliers().AugmentationMoneyCost;
    
    // calculate the level from the multiplier
    var level = log(multiplier, MULT_BASE);
	ns.tprint(level);
}

/** @param {NS} ns */
function getSourceFileLevel(ns, n) {
    const res = ns.singularity.getOwnedSourceFiles().find(f => f.n == n);
    return res ? res.lvl : 0;
}

/** @param {NS} ns */
function nofUninstalledAugs(ns) {
    return ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length
}

function log(x, b) {
    return Math.log(x) / Math.log(b)
}