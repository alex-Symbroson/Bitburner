
import * as servers from "./servers";
import * as util from "./util";

const sd = servers.data;
const { msg, err } = util;

/** @type {NS}     */ var ns;

/** @param {NS} _ns */
export async function main(_ns)
{
	servers.init(ns = _ns);
	util.init(ns = _ns);
	ns.tprint(Object.keys(sd.servers))

	for (const s of Object.values(sd.servers).filter(s => s.root))
	{
		//if (ns.args.includes(s.name)) continue;
		//crack(s)
		if (!s.root && servers.rootable(s)) hack(s)
		copy(s)
		if (ns.args.includes('-k')) ns.killall(s.name)
	}
	msg("done")
}

/** @param {servers.BBServer} s */
function hack(s)
{
	msg("hacking " + s.name)
	ns.nuke(s.name)
}

/** @param {servers.BBServer} s */
function crack(s)
{
	if (sd.crackNo > 0) ns.brutessh(s.name);
	if (sd.crackNo > 1) ns.ftpcrack(s.name);
	if (sd.crackNo > 2) ns.relaysmtp(s.name);
	if (sd.crackNo > 3) ns.httpworm(s.name);
	if (sd.crackNo > 4) ns.sqlinject(s.name);
}

/** @param {servers.BBServer} s */
function copy(s)
{
	msg(`copy ${s.name}`)
	ns.scp('mine.js', s.name) || err("copy")
	ns.scp('servers.js', s.name) || err("copy")
	ns.scp('data.txt', s.name) || err("copy")
}
