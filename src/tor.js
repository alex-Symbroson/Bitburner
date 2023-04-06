/// <reference path="../types.js"/>

/** @param {NS} ns */
export async function main(ns)
{
	const daemon = ns.args.includes('-d');
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

	while (!ns.singularity.purchaseTor())
		if (daemon) await ns.asleep(5e3);
		else return;

	if (!ns.args.includes('-f')) items.pop();

	while (items.length)
	{
		if (ns.singularity.purchaseProgram(items[0]))
			items.shift();
		else if (daemon) await ns.asleep(5e3);
		else return;
	}
}