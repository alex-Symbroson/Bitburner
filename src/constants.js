
export const AUG_KARMAS = [10e3, 20e3, 35e3];
export const AUGS_GANG = AUG_KARMAS.length;

/** @param {NS} ns */
export const getNAug = ns => Number(ns.read('naug.txt'));
/** @param {NS} ns */
export const setNAug = (ns, n = 0) => ns.write('naug.txt', String(n), "w");
