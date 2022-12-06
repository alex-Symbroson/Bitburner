
import * as servers from "./servers";
import * as utilx from "./utilx";

const sd = servers.data;
const { msg, err } = utilx;

/** @type {NS}     */ var ns;

/** @param {NS} _ns */
export async function main(_ns)
{
	servers.init(ns = _ns);
	utilx.init(ns = _ns);
	ns.tprint(Object.keys(sd.servers))

	for (const s of Object.values(sd.servers).filter(s => s.root && s.name != "home"))
	{
		//if (ns.args.includes(s.name)) continue;
		//crack(s)
		if (!s.root && servers.rootable(s)) hack(s)
		if (ns.args.includes('-c')) clear(s)
		if (ns.args.includes('-s')) copy(s)
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
	const files = [
		'mine.js', 'util.js',
		'servers.js', 'data.txt'
	];

	files.map(f => ns.fileExists(f, s.name) && (ns.rm(f, s.name) || err("rm " + f)));
	msg(`copy ${s.name}`)
	ns.scp(files, s.name) || err("copy")
}

/** @param {servers.BBServer} s */
function clear(s)
{
	msg("clearing " + s.name)
	for (const f of ns.ls(s.name))
		if (f.endsWith('.js') || f.endsWith('.txt'))
			ns.rm(f, s.name) || err("rm " + f);
}