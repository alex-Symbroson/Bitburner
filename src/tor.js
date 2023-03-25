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
		//"Formulas.exe"
	];

	const actions = [
		() => ns.singularity.purchaseTor(),
		...items.map(p => (() => ns.singularity.purchaseProgram(p)))
	];

	while (actions.length)
	{
		if (actions[0]())
		{
			ns.tprint(actions[0] + '');
			actions.shift();
		}
		else await ns.sleep(1000);
	}
}