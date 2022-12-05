/** @type {NS} */
var ns;
var host;

import * as servers from "servers";
const sd = servers.data;

/** @param {NS} ns */
export async function main(_ns)
{
	servers.init(ns = _ns);
	host = ns.getHostname();
	ns.tprint(Object.keys(sd.servers))
	
	for(const s of Object.values(sd.servers).filter(s => s.root))
	{
		if (s == "silver-helix") msg("!!!!!!!!!!!!!!!!!")
		//if (ns.args.includes(s.name)) continue;
		//crack(s)
		if (!s.root && servers.rootable(s)) hack(s)
		copy(s)
		if (ns.args.includes('-k')) ns.killall(s.name)
	}
	msg("done")
}

/** @param {string} target */
function hack(s)
{
	msg("hacking " + s.name)
	ns.nuke(s.name)
}

/** @param {string} target */
function crack(s)
{
	if (sd.crackNo > 0) ns.brutessh(s.name);
	if (sd.crackNo > 1) ns.ftpcrack(s.name);
	if (sd.crackNo > 2) ns.relaysmtp(s.name);
	if (sd.crackNo > 3) ns.httpworm(s.name);
	if (sd.crackNo > 4) ns.sqlinject(s.name);
}

function copy(s)
{
	msg(`copy ${s.name}`)
	ns.scp('mine.js', s.name) || err("copy")
	ns.scp('servers.js', s.name) || err("copy")
	ns.scp('data.js', s.name) || err("copy")
}

function msg(s) { ns.tprint(`  [${host}] ${s}`) }
function err(s) { msg("error: " + s); ns.exit(); }