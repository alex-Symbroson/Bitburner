
import * as servers from "./servers";
import * as util from "./util";

const sd = servers.data;
const { msg } = util;
/** @type {NS}    */ var ns;

/** @param {NS} _ns */
export async function main(_ns)
{
	servers.init(ns = _ns);
	util.init(ns = _ns)

	const svList = Object.values(sd.servers)
		.filter(s => s.root)

	msg(svList
		.sort((a, b) => a.maxMoney - b.maxMoney)
		.map(s => s.maxMoney.toExponential(2) + "\t: " + s.name)
		.join("\n"))
	msg(svList.length + " servers")

	msg(svList.map(s =>
	{
		const ram = ns.getScriptRam('mine.js') * (s.name == 'home' ? 2 : 1)
		const threads = Math.floor(s.maxRam / ram);
		if (threads <= 0) return
		if (threads * ram > s.maxRam - ns.getServerUsedRam(s.name)) return
		return `connect ${s.name}; run mine.js -t ${threads}; home;`
	}).filter(s => s).join("\n"))
}