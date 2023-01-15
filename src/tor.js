/// <reference path="../types.js"/>

/** @param {import("../Bitburner.t").NS} ns */
export async function main(ns)
{
	const items = ["BruteSSH.exe",
		"FTPCrack.exe",
		"relaySMTP.exe",
		"HTTPWorm.exe",
		"SQLInject.exe",
		"ServerProfiler.exe",
		"DeepscanV1.exe",
		"DeepscanV2.exe",
		"AutoLink.exe",
		"Formulas.exe"];
	
	const actions = [
		() => ns.singularity.travelToCity("Aevum"),
		() => ns.singularity.purchaseTor(),
		...items.map(p => (() => ns.singularity.purchaseProgram(p)))
	];

	while (actions.length)
	{
		await ns.sleep(1);
		if (!actions[0]()) continue;
		ns.tprint(actions[0] + '');
		actions.shift();
	}
}
