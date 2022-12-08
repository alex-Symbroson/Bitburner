
import * as srvd from "./serverData"
import { BBServerData } from "./servers";
import { fn2, logn } from "./util";

/** @type {NS} */ var ns;
/** @type {Partial<BBServerData>} */
let data = {};

/** @param {NS} _ns */
export async function main(_ns)
{
	data = srvd.init(ns = _ns);
	
	if (ns.args.includes('-c')) srvd.clearServers();
	if (ns.args.includes('-s')) scan();
	if (ns.args.includes('-i')) status();
}

function scan()
{
	for (const t of srvd.scanServerNames())
	{
		if (srvd.getServer(t)) continue;
		const d = srvd.addServer(t, false)
		ns.tprint(`  added ${t} lv${d.requiredHackingSkill}:${d.numOpenPortsRequired}`)
	}
}

function status()
{
	var rooted = 0, hackable = 0, unavail = 0;

	for (const d of srvd.getServers().sort((a, b) => srvScore(a) - srvScore(b)))
	{
		var status = "unavail"
		if (d.hasAdminRights) status = "root", rooted++;
		else if (srvd.rootable(d)) status = "avail", hackable++;
		else unavail++; // status = `unavail ${[d.requiredHackingSkill <= data.hackLv, d.numOpenPortsRequired <= data.crackNo]}`

		const moneyFmt = d.moneyMax.toExponential(2)
		ns.tprint(`  ${moneyFmt}$\t${status}\t ${d.numOpenPortsRequired}:${d.requiredHackingSkill}\t${d.hostname}`)
	}
	ns.tprint(`${rooted} rooted, ${hackable} rootable, ${unavail} unavailable`)
	ns.tprint(`lv ${data.hackLv}:${data.crackNo}`)
	ns.tprint(`maxRam ${fn2(ns.getPurchasedServerMaxRam())}`)
}

/** @param {NSServer} s */
function srvScore(s)
{
	return logn(s.requiredHackingSkill, 3) + s.numOpenPortsRequired
}