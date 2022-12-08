
import { clear, copy } from "./clear";
import * as srvd from "./serverData";
import { BBServerData } from "./servers";
import * as utilx from "./utilx";

const { msg } = utilx;

/** @type {Partial<BBServerData>} */
let data = {};

/** @param {NS} _ns */
export function init(_ns)
{
	utilx.init(_ns)
	data = srvd.init(_ns);
}

/** @param {NS} ns */
export async function main(ns)
{
	init(ns);
	var backdoor = []

	for (const s of srvd.getServers()) //.filter(s => !s.root))
	{
		//if (ns.args.includes(s.name)) continue;
		if (srvd.rootable(s)) 
		{
			if (!s.root) ns.nuke(s.name);
			crack(ns, s.name);
			backdoor.push(s.name)
		}
		if (ns.args.includes('-x')) clear(ns, s.name)
		if (ns.args.includes('-c')) copy(ns, s.name)
		if (ns.args.includes('-k')) ns.killall(s.name)
		await ns.sleep(10);
	}

	if (backdoor.length > 0) msg(backdoor.map(s =>
		`home;connect ${data.servers[s].path.join(";connect ")};backdoor`).join(";\n"))
	msg("done")
}

/** @type {(ns:NS, s:string) => void} */
export function crack(ns, s)
{
	if (data.crackNo > 0) ns.brutessh(s);
	if (data.crackNo > 1) ns.ftpcrack(s);
	if (data.crackNo > 2) ns.relaysmtp(s);
	if (data.crackNo > 3) ns.httpworm(s);
	if (data.crackNo > 4) ns.sqlinject(s);
}
