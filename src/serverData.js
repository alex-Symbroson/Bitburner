
import * as servers from "./servers";

/** @type {servers.BBServerData} */
let data = new servers.BBServerData();

/** @type {NS} */ var ns;

/** @param {NS} _ns */
export function init(_ns)
{
	ns = _ns;
	if (!_ns.fileExists(servers.file)) _ns.write(servers.file, "_={}")
	return update();
}

export function update()
{
	data.crackNo = data.cracks.map(f => Number(ns.fileExists(f))).reduce((a, b) => a + b)
	data.hackLv = ns.getHackingLevel();
	data.srvLimit = ns.getPurchasedServerLimit();
	clearServers();
	scanServers();
	return data;
}

export function scanServerNames()
{
    var n = 0, i = 999;
    const list = ["home"];
    while (i-- && n < list.length)
        list.push(...ns.scan(list[n]).filter(s => !list.includes(s) && n++));
	if (i >= 999) ns.tprint("WARNING: scanServer loop limit reached")
    return list;
}

export function scanServers()
{
    const list = scanServerNames().map(s => addServer(s, false))
	return (saveData(), list)
}

/** @type {(name:string, save:boolean) => servers.BBServer} */
export function addServer(name, save = true)
{
	data.servers[name] = new CServer(name)
	if (save) saveData();
	return data.servers[name]
}

/** @type {(name:string, save:boolean) => void} */
export function rmServer(name, save = true)
{
	delete data.servers[name]
	if (save) saveData();
}

export function clearServers()
{
	for(const k in data.servers)
		delete data.servers[k];
	saveData();
}


/** @type {(d:string|servers.BBServer) => boolean} */
export function rootable(s)
{
	if (typeof s === "string") s = data.servers[s]
	return data.hackLv >= s.reqHackLvl && data.crackNo >= s.reqPorts
}

/** @type {() => servers.BBServerData} */
export const getData = () => data

/** @type {(name:string) => servers.BBServer} */
export const getServer = (name) => data.servers[name]

/** @type {(filter?: (s: servers.BBServer) => boolean) => servers.BBServer[]} */
export const getServers = (filter = a => true) => 
	Object.values(data.servers).filter(filter);

const saveData = () => { ns.write(servers.file, '_=' + JSON.stringify(data, null, "  "), "w") }

export class CServer extends servers.BBServer
{
	/** @param {string} name */
	constructor(name)
	{
		super()
		this.name = name;
		this.root = ns.hasRootAccess(name);
		this.maxMoney = ns.getServerMaxMoney(name);
		this.maxRam = ns.getServerMaxRam(name);
		this.growth = ns.getServerGrowth(name);
		this.minSecLvl = ns.getServerMinSecurityLevel(name);
		this.reqPorts = ns.getServerNumPortsRequired(name);
		this.reqHackLvl = ns.getServerRequiredHackingLevel(name);
	}
}