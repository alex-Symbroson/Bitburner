
import * as servers from "./servers";
const data = servers.data;

/** @type {NS} */ var ns;

/** @param {NS} _ns */
export function init(_ns)
{
	servers.init(ns = _ns)
}

export function update()
{
	data.crackNo = data.cracks.map(f => Number(ns.fileExists(f))).reduce((a, b) => a + b)
	data.hackLv = ns.getHackingLevel();
}

/** @type {(name:string) => servers.BBServer} */
export function addServer(name)
{
	data.servers[name] = new CServer(name)
	save();
	return data.servers[name]
}

/** @type {() => servers.BBServerData} */
export const getData = () => data

/** @type {(name:string) => servers.BBServer} */
export const getServer = (name) => data.servers[name]

/** @type {() => servers.BBServer[]} */
export const getServers = () => Object.values(data.servers);

const save = () => { ns.write(servers.file, '_=' + JSON.stringify(data, null, "  "), "w") }
/** @return {CServer} */
const load = () => JSON.parse(String(ns.read(servers.file)).replace(/^.=/, ''))

class CServer extends servers.BBServer
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