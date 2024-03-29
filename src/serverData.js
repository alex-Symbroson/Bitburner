import * as servers from "./servers";
import * as utilx from "./utilx";
import { scanServerNames as _scanServerNames } from "./util_ssn";

/** @type {servers.BBServerData} */
let data = new servers.BBServerData();

/** @type {NS} */ var ns;

export const cracks = ['brutessh.exe', 'ftpcrack.exe', 'relaysmtp.exe', 'httpworm.exe', 'sqlinject.exe']

/** @param {NS} _ns */
export function init(_ns)
{
	utilx.init(ns = _ns);
	if (!_ns.fileExists(servers.file)) _ns.write(servers.file, "_={}")
	return update();
}

export function updateBasic()
{
	data.crackNo = getCrackNo(ns)
	data.hackLv = ns.getHackingLevel();
	data.srvLimit = ns.getPurchasedServerLimit();
	return data;
}

export function update()
{
	updateBasic();
	clearServers();
	scanServers();
	return data;
}

/** @type {(ns:NS) => number} */
export const getCrackNo = ns =>
	cracks.filter(f => ns.fileExists(f)).length;

export function scanServerPath(name = "home")
{
	const path = [name], list = ["home"], pre = /** @type {{[x:string]:string}} */ ({});
	for (var n = 0, i = 999; i-- && n < list.length; n++)
	{
		const scan = ns.scan(list[n]).filter(s => !list.includes(s))
		for (const s of scan) list.push(s), pre[s] = list[n];
		if (list[n] == name) break;
	}

	while (pre[name] != "home" && !getServer(name).backdoorInstalled) path.push(pre[name]), name = pre[name];
	if (i >= 999) ns.tprint("WARNING: scanServer loop limit reached")
	return path.reverse()
}

export const scanServerNames = _scanServerNames;

export function scanServers()
{
	const list = scanServerNames(ns).map(s => addServer(s, false))
	return (saveData(), list)
}

/** @type {(name:string, save?:boolean, bdoor?:boolean) => Server} */
export function addServer(name, save = true, bdoor = false)
{
	data.servers[name] = ns.getServer(name)
	if (save) saveData();
	return data.servers[name]
}

/** @type {(name:string, save?:boolean) => void} */
export function rmServer(name, save = true)
{
	delete data.servers[name]
	if (save) saveData();
}

export function clearServers()
{
	for (const k in data.servers)
		delete data.servers[k];
	saveData();
}

/** @return {number} */
export function getMaxRam()
{
    return Math.max.apply(null, getServers(s => s.purchasedByPlayer).map(s => s.maxRam));
}


/** @type {(s:string|Server) => boolean} */
export function rootable(s)
{
	const serv = typeof s === "string" ? getServer(s) : s
	return data.hackLv >= serv.requiredHackingSkill && data.crackNo >= serv.numOpenPortsRequired
}

/** @type {() => servers.BBServerData} */
export const getData = () => data

/** @type {(name:string) => Server} */
export const getServer = name => data.servers[name] || ns.getServer(name)

/** @type {(filter?: (s: Server) => boolean) => Server[]} */
export const getServers = (filter = a => true) =>
	Object.values(data.servers).filter(filter);

const saveData = () => utilx.save(servers.file, data);
