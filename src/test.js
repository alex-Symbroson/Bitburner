
import * as srvd from "./serverData"
import { BBServerData } from "./servers";
import { fn2 } from "./util";

/** @type {NS} */ var ns;
/** @type {Partial<BBServerData>} */
let data = {};

/** @param {NS} _ns */
export async function main(_ns)
{
	data = srvd.init(ns = _ns);
	
	if (ns.args.includes('-c')) srvd.clearServers();
	if (ns.args.includes('-s')) scan("home");
	if (ns.args.includes('-i')) status();
}

var scanned = ["home"]

/** @type {(s:string) => void} */
function scan(s)
{
	srvd.addServer(s)
	for (var t of ns.scan(s))
	{
		if (!srvd.getServer(t))
		{
			const d = srvd.addServer(t)
			ns.tprint(`  added ${t} lv${d.reqHackLvl}:${d.reqPorts}`)
		}
		if (!scanned.includes(t)) scanned.push(t), scan(t)
	}
}

function status()
{
	var hacked = 0, hackable = 0, unavail = 0;

	for (const d of srvd.getServers().sort((a, b) => a.maxMoney - b.maxMoney))
	{
		var status = "unavail"
		if (d.root) hacked++, status = "root"
		else if (srvd.rootable(d)) hackable++, status = "avail"
		else unavail++; // status = `unavail ${[d.reqHackLvl <= data.hackLv, d.reqPorts <= data.crackNo]}`

		const moneyFmt = d.maxMoney.toExponential(2)
		ns.tprint(`  ${moneyFmt}$\t${status}\t ${d.reqPorts}:${d.reqHackLvl}\t${d.name}`)
	}
	ns.tprint(`${hacked} rooted, ${hackable} rootable, ${unavail} unavailable`)
	ns.tprint(`lv ${data.hackLv}:${data.crackNo}`)
	ns.tprint(`maxRam ${fn2(ns.getPurchasedServerMaxRam())}`)
}
