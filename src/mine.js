
import * as servers from "./servers";
const sd = servers.data;

/** @type {NS} */ var ns;

/** @param {NS} _ns */
export async function main(_ns)
{
	servers.init(ns = _ns)
	ns.print("------")
	ns.print("args: " + ns.args)

	const hostname = ns.getHostname();
	const host = sd.servers[hostname];
	if (!host) throw Error(`Host ${hostname} not registered`)

	const ram = 2.25; // ns.getxScriptxRam(ns.getScriptName());
	const threads = Math.floor(host.maxRam / ram);
	const rs = Object.values(sd.servers).filter(s => s.root).map(updateVals)
	ns.print(`threads: ${host.maxRam} / ${ram} = ${threads}`)

	var nhack = 1;
	while(true)
	{
		var target = sd.servers["iron-gym"];
		if (ns.args.includes('-m')) target = selectWeighted(rs, s => s.moneyAvail);
		// rs.sort((a, b) => b.moneyAvail - a.moneyAvail)[0];
		
		const moneyThresh = target.maxMoney * 0.75;
		const moneyThresh2 = target.maxMoney * 0.2;
		const secThresh = target.minSecLvl + 5;
		
		if (ns.args.includes('-m')) await ns.hack(target.name, { threads });
		else if (target.secLvl > secThresh) await ns.weaken(target.name, { threads });
		else if (target.moneyAvail < moneyThresh2 || target.moneyAvail < moneyThresh && nhack-- < 1)
		{
			const g = await ns.grow(target.name, { threads });
			nhack = Math.round(0.005 / (g - 0.01)) | 0;
			ns.print("grown by " + g + (nhack >= 1 ? " hack x" + nhack : ""));
		}
		else await ns.hack(target.name, { threads });
		updateVals(target)
	}
}

/** @type {(s:servers.BBServer) => servers.BBServer} */
function updateVals(s)
{
	s.moneyAvail = ns.getServerMoneyAvailable(s.name);
	s.secLvl = ns.getServerSecurityLevel(s.name);
	s.lastMoney = 0;
	return s
}

/** @type {<T>(list: T[], m: (e:T) => number) => T} */
function selectWeighted(list, m = e => Number(e))
{
	const sum = list.map(m).reduce((a, b) => a + b);
	var r = sum * Math.random();
	return list.find(s => (r -= m(s)) < 0);
}