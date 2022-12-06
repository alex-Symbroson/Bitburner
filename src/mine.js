
import * as servers from "./servers";
import { fn2, logn } from "./util";
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
	const threads = Number(ns.args[0])

	const hostname = ns.getHostname();
	const host = sd.servers[hostname];
	if (!host) throw Error(`Host ${hostname} not registered`)

	const rootedServers = Object.values(sd.servers)
		.filter(s => s.root && s.name != 'home')
		.map(s => updateVals(sd.servers[s.name]))
	const moneyServers = rootedServers.filter(s => s.maxMoney)
	const weightedServers = closeWeights(moneyServers, s => s.maxRam, host.maxRam, 5)

	if (ns.args.includes('-s')) rangeStats(rootedServers, moneyServers);
	else while (true)
	{
		const target = selectWeighted(weightedServers, s => s.w).e;
		const moneyThresh = target.maxMoney * moneyThreshFac;
		const secThresh = target.minSecLvl * secThreashFac;

		ns.print(`money ${target.moneyAvail.toExponential(2)} / ${moneyThresh.toExponential(2)} / ${target.maxMoney.toExponential(2)})`)
		ns.print(`sec   ${target.secLvl.toFixed(2)} / ${secThresh.toFixed(2)} / ${target.minSecLvl.toFixed(2)})`)

		if (target.secLvl > secThresh)
		{
			ns.tprint(`weaken ${hostname} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
			await ns.weaken(target.name, { threads });
		}
		else if (target.moneyAvail < moneyThresh)
		{
			ns.tprint(`grow ${hostname} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
			await ns.grow(target.name, { threads });
		}
		else
		{
			ns.tprint(`hack ${hostname} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
			await ns.hack(target.name, { threads });
		}

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

/** @type {(rs:servers.BBServer[], ms:servers.BBServer[]) => void} */
function rangeStats(rs, ms)
{
	//for (const s of rs)
	//	ns.tprint(`${s.maxMoney.toExponential(2)}\t${s.maxRam}\t${(s.maxRam / 2).toFixed(2)} - ${(s.maxRam * 2).toFixed(2)}\t${s.name}`)

	for (var r = 1; r <= 1<<8; r+=r)
	{
		const map = new Array(8).fill(0)
		const weights = closeWeights(ms, s => s.maxRam, r)
		for (var i = 0; i < 1e5; i++)
			map[logn(selectWeighted(weights, e => e.w).w, 2)]++;
		ns.tprint(`r ${r}: ` + map)
	}
	ns.tprint(ms.map(s => logn(s.maxRam, 2)))
}

/** @type {<T>(list: T[], m: (e:T) => number, invert: boolean) => T} */
function selectWeighted(list, m = e => Number(e))
{
	const sum = list.reduce((a, b) => a + m(b), 0);
	var r = sum * Math.random();
	return list.find(s => (r -= m(s)) < 0);
}

/** @type {<T>(list: T[], m: (e:T) => number, f: number, base: number, stepExp: number) => {e:T, w:number}[]} */
function closeWeights(list, m = e => Number(e), f = 0, base = 2, stepExp = 10)
{
	const map = list.map(e => ({ e, w: Math.abs(logn(m(e), base) - logn(f, base)) }))
		.filter(e => isFinite(e.w)) // whyy is there a server with 0 RAM ?!

	const max = Math.max.apply(null, map.map(e => e.w))
	for (const e of map) e.w = stepExp ** (max - e.w)
	return map
}
