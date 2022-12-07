
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
};

/** @param {NS} _ns */
export async function main(_ns)
{
	init(ns = _ns);

	for (const s of srvd.scanServers().filter(s => s.root && s.name != "home"))
	{
		//if (ns.args.includes(s.name)) continue;
		crack(s)
		if (!s.root && srvd.rootable(s)) hack(s)
		if (ns.args.includes('-x')) clear(s)
		if (ns.args.includes('-c')) copy(s)
		if (ns.args.includes('-k')) ns.killall(s.name)
	}
	msg("done")
}

/** @param {BBServer} s */
function hack(s)
{
	msg("hacking " + s.name)
	ns.nuke(s.name)
}

/** @param {BBServer} s */
function crack(s)
{
	if (data.crackNo > 0) ns.brutessh(s.name);
	if (data.crackNo > 1) ns.ftpcrack(s.name);
	if (data.crackNo > 2) ns.relaysmtp(s.name);
	if (data.crackNo > 3) ns.httpworm(s.name);
	if (data.crackNo > 4) ns.sqlinject(s.name);
}

/** @param {BBServer} s */
export function copy(s)
{
	const files = [
		'mine.js', 'util.js',
		'servers.js', 'data.txt',
		's_weaken.js', 's_grow.js', 's_hack.js'
	];

	files.map(f => ns.fileExists(f, s.name) && (ns.rm(f, s.name) || err("rm " + f)));
	msg(`copy ${s.name}`)
	ns.scp(files, s.name) || err("copy")
}

/** @param {BBServer} s */
function clear(s)
{
	msg("clearing " + s.name)
	for (const f of ns.ls(s.name))
		if (f.endsWith('.js') || f.endsWith('.txt'))
			ns.rm(f, s.name) || err("rm " + f);
}