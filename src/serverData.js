
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
	scanServers();
	return data;
}

/** @type {(name:string) => servers.BBServer} */
export function addServer(name)
{
	data.servers[name] = new CServer(name)
	save();
	return data.servers[name]
}

export function scanServerNames()
{
    var n = 0, i = 999;
    const list = ["home"];
    while (i-- && n < list.length)
        list.push(...ns.scan(list[n]).filter(s => !list.includes(s) && n++));
    return list;
}

export function scanServers()
{
    const list = scanServerNames().map(s => data.servers[s] = new CServer(s))
	return (save(), list)
}

/** @type {(name:string) => void} */
export function rmServer(name)
{
	delete data.servers[name]
	save();
}

export function clearServers()
{
	for(const k in data.servers)
		delete data.servers[k];
	save();
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

const save = () => { ns.write(servers.file, '_=' + JSON.stringify(data, null, "  "), "w") }

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