
import * as srvd from "./serverData";
import { BBServer, BBServerData } from "./servers";
import * as utilx from "./utilx";

const { msg, err } = utilx;

/** @type {Partial<BBServerData>} */
let data = {};

/** @type {NS} */
var ns;

/** @param {NS} _ns */
export function init(_ns)
{
	utilx.init(ns = _ns)
	data = srvd.init(ns = _ns);
}

/** @param {NS} _ns */
export async function main(_ns)
{
	init(ns = _ns);
	srvd.scanServerPaths()
	var backdoor = []

	for (const s of srvd.getServers()) //.filter(s => !s.root))
	{
		//if (ns.args.includes(s.name)) continue;
		if (!s.root && srvd.rootable(s)) hack(s), backdoor.push(s.name)
		if (ns.args.includes('-x')) clear(s)
		if (ns.args.includes('-c')) copy(s)
		if (ns.args.includes('-k')) ns.killall(s.name)
		await ns.sleep(10);
	}

	if (backdoor.length > 0) msg(backdoor.map(s => 
		`home;connect ${data.servers[s].path.join(";connect ")};backdoor`).join(";\n"))
	msg("done")
}

/** @param {BBServer} s */
export function hack(s)
{
	if (data.crackNo > 0) ns.brutessh(s.name);
	if (data.crackNo > 1) ns.ftpcrack(s.name);
	if (data.crackNo > 2) ns.relaysmtp(s.name);
	if (data.crackNo > 3) ns.httpworm(s.name);
	if (data.crackNo > 4) ns.sqlinject(s.name);
	ns.nuke(s.name)
}

/** @param {BBServer} s */
export function copy(s)
{
	const files = [
		'mine.js', 'util.js',
		'servers.js', 'data.txt',
		's_weaken.js', 's_grow.js', 's_hack.js'
	];

	if (s.name == "home") return;
	msg(`copy ${s.name}`)
	for (const f of files)
	{
		if (ns.fileExists(f, s.name)) ns.rm(f, s.name) || err("rm " + f);
		ns.scp(f, s.name) || err("copy " + f)
	}
}

/** @param {BBServer} s */
function clear(s)
{
	msg("clearing " + s.name)
	for (const f of ns.ls(s.name))
		if (f.endsWith('.js') || f.endsWith('.txt'))
			ns.rm(f, s.name) || err("rm " + f);
}