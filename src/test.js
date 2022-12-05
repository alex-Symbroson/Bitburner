import * as sd from "serverData"
import {rootable} from "servers"

/** @type {NS} */
var ns;


/** @param {NS} ns */
export async function main(_ns) {
	sd.init(ns = _ns);
	
	if (ns.args.includes('-u')) sd.update();
	if (ns.args.includes('-i')) status();
	if (ns.args.includes('-s')) scan("home");
}

function update()
{
	ns.tprint(`lv ${sd.data.hackLv}:${sd.data.crackNo}`)
}

var scanned = []
function scan(s)
{
	sd.addServer(s)
	for(var t of ns.scan(s))
	{
		if(!sd.getServer(t))
		{
			const d = sd.addServer(t)
			ns.tprint(`  added ${t} lv${d.reqHackLvl}:${d.reqPorts}`)
		}
		if(!scanned.includes(t)) scanned.push(t), scan(t)
	}
}

function status()
{
	const data = sd.getData();
	for(const d of sd.getServer().sort((a,b) => a.maxMoney - b.maxMoney))
	{
		var status = "unavail"
		if (d.root) status = "root"
		else if(rootable(d)) status = "rootable"
		else status = `unavail ${[d.reqHackLvl <= data.hackLv, d.reqPorts <= data.crackNo]}`

		const moneyFmt = d.maxMoney.toExponential(2)
		ns.tprint(`  ${moneyFmt}$\t${status}\t${d.name} ${d.reqHackLvl}:${d.reqPorts}`)
	}
}

const fn = (i, f = 0, d = 3) => (i * 10**(f+d) | 0) / 10**(d);