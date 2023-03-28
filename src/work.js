/** @typedef {{name:string,favor:number,rep:number}} Fac */
import { fn2 } from "./util";
import { task } from "./utilTask";

var lstSkip = /** @type {string[]} */ ([]);

const preGangFactions = ["CyberSec", "NiteSec"];

/** @param {NS} ns */
export async function main(ns)
{
	let workFac = "";
	while (1)
	{
		await ns.asleep(4000);
		const p = ns.getPlayer();
		const naugs = Number(ns.read('naug.txt'));
		const preGangFac = preGangFactions.find(f => p.factions.includes(f));
		const workFacs = getBestFavorFactions(ns, p);
		const newWorkFac = (naugs < 3 ? preGangFac : null) || workFacs[0].name;

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
	const gangFaction = ns.gang.getGangInformation()?.faction;
	/** @type {Fac[]} */
	const facs = p.factions.map(name => ({
		name,
		rep: ns.singularity.getFactionRep(name),
		favor: ns.singularity.getFactionFavor(name)
	}));
	facs.sort((a, b) => b.favor - a.favor);
	if (facs[0]?.name == gangFaction) facs.shift();

	/** @type {Fac[]} */
	const workFacs = [];

	for (var f of facs)
	{
		if (f.favor >= 150) ns.singularity.donateToFaction(f.name, p.money / 400);
		else if (newFavor(ns, f) < 150) workFacs.push(f);
		else if (!lstSkip.includes(f.name))
		{
			lstSkip.push(f.name);
			ns.tprint(`WARN skipped ${f.name}: ${f.favor | 0} -> ${newFavor(ns, f) | 0} (${fn2(f.rep)})`);
		}
	}

	return facs;
}

/** @type {(ns:NS,f:Fac)=>number} */
function newFavor(ns, f)
{
	return f.favor + ns.singularity.getFactionFavorGain(f.name);
}