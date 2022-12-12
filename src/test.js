
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
	var rooted = 0, hackable = 0, unavail = 0, filter = '';
	if (ns.args.includes('-f')) filter = String(ns.args[ns.args.indexOf('-f') + 1]);

	for (const d of srvd.getServers().sort((a, b) => srvScore(a) - srvScore(b)))
	{
		var status = "unavail"
		if (d.purchasedByPlayer) status = "purch", rooted++;
		else if (d.hasAdminRights) status = "root", rooted++;
		else if (srvd.rootable(d)) status = "avail", hackable++;
		else unavail++; // status = `unavail ${[d.requiredHackingSkill <= data.hackLv, d.numOpenPortsRequired <= data.crackNo]}`

		if (filter && !status.startsWith(filter)) continue;

		const moneyFmt = d.moneyMax.toExponential(2)
		const path = d.hasAdminRights || d.backdoorInstalled ? "" : srvd.scanServerPath(d.hostname).join("/")
		ns.tprint(`  ${moneyFmt}$\t${status}\t ${d.numOpenPortsRequired}:${d.requiredHackingSkill}\t${path || d.hostname}`)
	}
	ns.tprint(`${rooted} rooted, ${hackable} rootable, ${unavail} unavailable`)
	ns.tprint(`lv ${data.hackLv}:${data.crackNo}`)
	ns.tprint(`maxRam ${fn2(ns.getPurchasedServerMaxRam())}`)
}

/** @param {Server} s */
function srvScore(s)
{
	return logn(s.requiredHackingSkill, 3) + s.numOpenPortsRequired
}
