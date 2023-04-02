import { canGang, clearFlag, gangFaction, setFlag } from "./constants";
import { task } from "./utilTask";

/** @param {NS} ns */
export async function main(ns)
{
	var joined = false;
	while (1)
	{
		await ns.asleep(1200);
		if (ns.singularity.upgradeHomeRam()) ns.tprint('WARN upgraded home RAM');
		await ns.asleep(1200);
		if (ns.singularity.upgradeHomeCores()) ns.tprint('WARN upgraded home COREs');
		await ns.asleep(700);

		for (const f of ns.singularity.checkFactionInvitations())
		{
			await ns.asleep(100);
			task(ns, "fjoin", f);
		}

		await ns.asleep(900);
		if (!joined && canGang(ns))
		{
			if (ns.readPort(101) == 'ok') joined = true;
			else task(ns, "gcreate", gangFaction);
		}
	}
}