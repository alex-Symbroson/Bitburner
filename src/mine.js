
import * as servers from "./servers";
import { closeWeights, fn2, logn, selectWeighted } from "./util";

/** @param {NS} ns */
export async function main(ns)
{
	ns.print("------")
	ns.print("args: " + ns.args)

	const moneyThreshFac = 0.9;
	const secThreashFac = 1.5;
	const sd = servers.load(ns);

	const threads = Number(ns.args[0])

	const hostname = ns.getHostname();
	const host = sd.servers[hostname];
	if (!host) throw Error(`Host ${hostname} not registered`)

	const rootedServers = Object.values(sd.servers)
		.filter(s => s.root && s.name != 'home')
		.map(s => updateVals(ns, sd.servers[s.name]))
	const moneyServers = rootedServers.filter(s => s.maxMoney)
	const weightedServers = closeWeights(moneyServers, s => s.maxRam, host.maxRam, 5)

	while (true)
	{
		const target = selectWeighted(weightedServers, s => s.w).e;
		const moneyThresh = target.maxMoney * moneyThreshFac;
		const secThresh = target.minSecLvl * secThreashFac;

		ns.print(`money ${target.moneyAvail.toExponential(2)} / ${moneyThresh.toExponential(2)} / ${target.maxMoney.toExponential(2)})`)
		ns.print(`sec   ${target.secLvl.toFixed(2)} / ${secThresh.toFixed(2)} / ${target.minSecLvl.toFixed(2)})`)

		if (target.secLvl > secThresh)
		{
			//ns.tprint(`weaken ${hostname} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
			await ns.weaken(target.name, { threads });
		}
		else if (target.moneyAvail < moneyThresh)
		{
			//ns.tprint(`grow ${hostname} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
			await ns.grow(target.name, { threads });
		}
		else
		{
			//ns.tprint(`hack ${hostname} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
			await ns.hack(target.name, { threads });
		}

		updateVals(ns, target)
	}
}

/** @type {(ns:NS, s:servers.BBServer) => servers.BBServer} */
function updateVals(ns, s)
{
	s.moneyAvail = ns.getServerMoneyAvailable(s.name);
	s.secLvl = ns.getServerSecurityLevel(s.name);
	return s
}