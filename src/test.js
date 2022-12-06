
import * as serverData from "./serverData"
import * as servers from "./servers"
const sd = servers.data;

/** @type {NS} */ var ns;


/** @param {NS} _ns */
export async function main(_ns)
{
	serverData.init(ns = _ns);

	if (ns.args.includes('-u')) serverData.update();
	if (ns.args.includes('-i')) status();
	if (ns.args.includes('-s')) scan("home");
}

var scanned = ["home"]

/** @type {(s:string) => void} */
function scan(s)
{
	serverData.addServer(s)
	for (var t of ns.scan(s))
	{
		if (!serverData.getServer(t))
		{
			const d = serverData.addServer(t)
			ns.tprint(`  added ${t} lv${d.reqHackLvl}:${d.reqPorts}`)
		}
		if (!scanned.includes(t)) scanned.push(t), scan(t)
	}
}

function status()
{
	var hacked = 0, hackable = 0, unavail = 0;

	for (const d of serverData.getServers().sort((a, b) => a.maxMoney - b.maxMoney))
	{
		var status = "unavail"
		if (d.root) hacked++, status = "root"
		else if (servers.rootable(d)) hackable++, status = "rootable"
		else unavail++; // status = `unavail ${[d.reqHackLvl <= data.hackLv, d.reqPorts <= data.crackNo]}`

		const moneyFmt = d.maxMoney.toExponential(2)
		ns.tprint(`  ${moneyFmt}$\t${status}\t ${d.reqPorts}:${d.reqHackLvl}\t${d.name}`)
	}
	ns.tprint(`${hacked} rooted, ${hackable} rootable, ${unavail} unavailable`)
	ns.tprint(`lv ${sd.hackLv}:${sd.crackNo}`)
	ns.tprint(`maxRam ${ns.getPurchasedServerMaxRam()}`)
}