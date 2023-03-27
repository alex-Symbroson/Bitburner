/** @typedef {{name:string,favor:number,rep:number}} Fac */
import { fn2 } from "./util";
import { task } from "./utilTask";

var lstSkip = /** @type {string[]} */ ([]);

/** @param {NS} ns */
export async function main(ns)
{
	let workFac = "";
	while (1)
	{
		await ns.asleep(4000);

		const p = ns.getPlayer();
		/** @type {Fac[]} */
		const facs = p.factions.map(name => ({
			name,
			rep: ns.singularity.getFactionRep(name),
			favor: ns.singularity.getFactionFavor(name)
		}));
		facs.sort((a, b) => b.favor - a.favor);
		try
		{
			if (facs[0].name == ns.gang.getGangInformation().faction) facs.shift();
		} catch (e) { }

		var newWorkFac = workFac;

		for (var f of facs)
		{
			if (f.favor >= 150) ns.singularity.donateToFaction(f.name, p.money / 400);
			else if (newFavor(ns, f) < 150) { newWorkFac = f.name; break; }
			else if (!lstSkip.includes(f.name))
			{
				lstSkip.push(f.name);
				ns.tprint(`WARN skipped ${f.name}: ${f.favor | 0} -> ${newFavor(ns, f) | 0} (${fn2(f.rep)})`);
			}
		}

		// if (p.factions.includes("Daedalus")) newWorkFac = "Daedalus";
		//ns.tprint(newWorkFac + ': ' + facs.map(f => f.name))
		if (newWorkFac && workFac != newWorkFac)
		{
			ns.tprint("WARN working for " + newWorkFac);
			if (newWorkFac) task(ns, "workf", workFac = newWorkFac, "hacking");
		}
	}
}

/** @type {(ns:NS,f:Fac)=>number} */
function newFavor(ns, f)
{
	return f.favor + ns.singularity.getFactionFavorGain(f.name);
}