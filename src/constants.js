
export const KARMA_DELTA = 12e3;

const fNAug = 'naug.txt';
const fFlag = 'flags.txt';

/** @param {NS} ns */
export const getNAug = ns => Number(ns.read(fNAug));
/** @param {NS} ns */
export const setNAug = (ns, n = 0) => ns.write(fNAug, String(n), "w");

/**
 * Used Flags
 * P - disable purchase.js before almost installing augs
 */
/** @param {NS} ns */
export const setFlag = (ns, f = '') => ns.write(fFlag, `,${f},`, 'a');
/** @param {NS} ns */
export const getFlag = (ns, f = '') => ns.read(fFlag).includes(`,${f},`);
/** @param {NS} ns */
export const clearFlag = (ns, f = '') => ns.write(fFlag, ns.read(fFlag).replace(RegExp(`,${f},`, 'g'), ''), 'w');
