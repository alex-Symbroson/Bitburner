import { canGang, clearFlag, gangFaction, setFlag } from "./constants";
import { task } from "./utilTask";

/** @param {NS} ns */
export async function main(ns)
{
	var joined = false;
	const daemon = ns.args.includes('-d');
	do
	{
		if (daemon) await ns.asleep(1200);
		if (ns.singularity.upgradeHomeRam()) ns.tprint('WARN upgraded home RAM');
		if (daemon) await ns.asleep(1200);
		if (ns.singularity.upgradeHomeCores()) ns.tprint('WARN upgraded home COREs');
		if (daemon) await ns.asleep(700);

		for (const f of ns.singularity.checkFactionInvitations())
		{
			if (daemon) await ns.asleep(100);
			task(ns, "fjoin", f);
		}

		if (daemon) await ns.asleep(900);
		if (!joined && canGang(ns))
		{
			if (ns.readPort(101) == 'ok') joined = true;
			else task(ns, "gcreate", gangFaction);
		}
	} while (daemon);
}