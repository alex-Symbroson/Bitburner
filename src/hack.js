import { copy } from "./clear";
import * as srvd from "./serverData";

/** @param {NS} ns */
export async function main(ns)
{
    init(ns);
    checkServer(ns, srvd.getServer(String(ns.args[0])))
}

/** @param {NS} ns */
export function init(ns)
{
	srvd.init(ns);
}

/** @type {(ns: NS, s: Server) => void} s */
export function checkServer(ns, s)
{
	srvd.scanServers();
	const data = srvd.updateBasic();
	if (s.hostname == "home" || s.purchasedByPlayer || !srvd.rootable(s)) return;
	if (s.openPortCount < data.crackNo) crack(ns, s.hostname);
	if (!s.hasAdminRights) ns.nuke(s.hostname);
	copy(ns, s.hostname);

	if (!s.backdoorInstalled)
	{
		const path = srvd.scanServerPath(s.hostname)
		backdoor(ns, path);
	}
}

const bdoors = /** @type {{[name:string]:bool}} */ {};
/** @type {(ns:NS, path: string[]) => void} */
function backdoor(ns, path)
{
	try
	{
		const name = path[path.length-1];
		if (bdoors[name]) return;
		var pid = ns.exec("backdoor.js", "home", 1, ...path);
		if (!pid) return ns.tprint(`ERROR backdooring ${name} failed`);
		bdoors[name] = true;
		ns.tprint(`INFO backdooring ${name} : ${pid}`);
	}
	catch(e)
	{
		if (path.length < 4 || ns.args.includes("-a"))
			ns.tprint(`  home;connect ${path.join(";connect ")};backdoor`);
	}
}

/** @type {(ns:NS, s:string) => void} */
export function crack(ns, s)
{
	['brutessh.exe', 'ftpcrack.exe', 'relaysmtp.exe', 'httpworm.exe', 'sqlinject.exe']
	if (ns.fileExists('brutessh.exe')) ns.brutessh(s);
	if (ns.fileExists('ftpcrack.exe')) ns.ftpcrack(s);
	if (ns.fileExists('relaysmtp.exe')) ns.relaysmtp(s);
	if (ns.fileExists('httpworm.exe')) ns.httpworm(s);
	if (ns.fileExists('sqlinject.exe')) ns.sqlinject(s);
}
