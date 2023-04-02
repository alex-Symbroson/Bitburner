/// <reference path="../types.js"/>

/** @param {NS} ns */
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
		"Formulas.exe"
	];

	while (!ns.singularity.purchaseTor()) ns.sleep(5e3);
	ns.tprint('purchased tor router');

	if (!ns.args.includes('-t')) items.pop();

	while (items.length)
	{
		if (ns.singularity.purchaseProgram(items[0]))
		{
			ns.tprint('purchased ' + items[0]);
			items.shift();
		}
		else await ns.sleep(5e3);
	}
}