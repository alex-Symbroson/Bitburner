
import * as servers from "./servers";
const sd = servers.data;

const moneyThreshFac = 0.9;
const secThreashFac = 1.5;

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

	const ram = 2.35 * (hostname == 'home' ? 2 : 1);
	const threads = Math.floor(host.maxRam / ram);
	const rs = Object.values(sd.servers)
		.filter(s => s.root && s.name != 'home')
		.map(updateVals)

	ns.print(`threads: ${host.maxRam} / ${ram} = ${threads}`)

	while (true)
	{
		var target = sd.servers["iron-gym"];
		if (ns.args.includes('-m')) target = selectWeighted(rs, s => s.moneyAvail);
		// rs.sort((a, b) => b.moneyAvail - a.moneyAvail)[0];

		const moneyThresh = target.maxMoney * moneyThreshFac;
		const secThresh = target.minSecLvl * secThreashFac;

		ns.print(`money ${target.moneyAvail.toExponential(2)} / ${moneyThresh.toExponential(2)} / ${target.maxMoney.toExponential(2)})`)
		ns.print(`sec   ${target.secLvl.toFixed(2)} / ${secThresh.toFixed(2)} / ${target.minSecLvl.toFixed(2)})`)

		if (target.secLvl > secThresh)
			await ns.weaken(target.name, { threads });
		else if (target.moneyAvail < moneyThresh)
			await ns.grow(target.name, { threads });
		else
			await ns.hack(target.name, { threads });

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