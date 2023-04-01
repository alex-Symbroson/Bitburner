/** @typedef {{name:string,favor:number,rep:number}} Fac */
import { fn2 } from "./util";
import { task } from "./utilTask";

var lstSkip = /** @type {string[]} */ ([]);

const preGangFactions = ["NiteSec", "CyberSec"];

/** @param {NS} ns */
export async function main(ns)
{
	let workFac = "";
	while (1)
	{
		await ns.asleep(4000);
		const p = ns.getPlayer();
		const preGangFac = preGangFactions.find(f => p.factions.includes(f));
		const workFacs = getBestFavorFactions(ns, p);
		const newWorkFac = (ns.heart.break() > -54e3 ? preGangFac : null) || workFacs[0]?.name;

		if (newWorkFac && workFac != newWorkFac)
		{
			ns.tprint("WARN working for " + newWorkFac);
			task(ns, "workf", workFac = newWorkFac, "hacking");
		}
	}
}

/** @type {(ns:NS, p:Player) => Fac[]} */
function getBestFavorFactions(ns, p)
{
	const donateFavor = ns.getFavorToDonate();
	var gangFaction = '';
	try { gangFaction = ns.gang.getGangInformation().faction; }
	catch(e) {}
	return p.factions
		.map(name => ({
			name,
			rep: ns.singularity.getFactionRep(name),
			favor: ns.singularity.getFactionFavor(name)
		}))
		.sort((a, b) => b.favor - a.favor)
		.filter(f =>
		{
			if (f.name == gangFaction) return false;
			if (f.favor >= donateFavor)
			{
				if (f.name == "Daedalus" && ns.singularity.getFactionRep(gangFaction) < 2e6)
					ns.singularity.donateToFaction(f.name, p.money / 10);
				else
					ns.singularity.donateToFaction(f.name, p.money / 400);
			}
			else if (newFavor(ns, f) < donateFavor) return true;
			else if (!lstSkip.includes(f.name))
			{
				lstSkip.push(f.name);
				ns.tprint(`WARN skipped ${f.name}: ${f.favor | 0} -> ${newFavor(ns, f) | 0} (${fn2(f.rep)})`);
			}
			return f.name == "Daedalus";
		});
}

/** @type {(ns:NS,f:Fac)=>number} */
function newFavor(ns, f)
{
	return f.favor + ns.singularity.getFactionFavorGain(f.name);
}