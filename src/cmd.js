import * as servers from "servers";
const sd = servers.data;

/** @type {NS} */
var ns;
var host;


/** @param {NS} ns */
export async function main(_ns)
{
	servers.init(ns = _ns);
	host = ns.getHostname();

	const svList = Object.values(sd.servers)
		.filter(s => s.root)
	
	msg(svList
		.filter(s => s.root)
		.sort((a, b) => a.maxMoney - b.maxMoney)
		.map(s => s.maxMoney.toExponential(2) + "\t: " + s.name)
		.join("\n"))
	msg(svList.length + " servers")

	msg(svList.map(s => {
		const ram = 2.25 - (s.name=='home'?4:0)//ns.getScriptRam('mine.js');
		const threads = Math.floor(s.maxRam / ram);
		// ns.tprint([s.name, s.maxRam, ns.getServerMaxRam(s.name), ns.getServerUsedRam(s.name)])

		return `connect ${s.name}; run mine.js -t ${threads}; home;`
	}).join("\n"))
}

function msg(s) { ns.tprint(`  [${host}] ${s}`) }
function err(s) { msg("error: " + s); }