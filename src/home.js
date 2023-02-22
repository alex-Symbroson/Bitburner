/** @param {NS} ns */
export async function main(ns)
{
	while (1)
	{
		await ns.asleep(4000);
		if (ns.singularity.upgradeHomeCores()) ns.tprint('WARN upgraded home COREs');
		if (ns.singularity.upgradeHomeRam()) ns.tprint('WARN upgraded home RAM');

		for (const f of ns.singularity.checkFactionInvitations())
			ns.singularity.joinFaction(f);
	}
}