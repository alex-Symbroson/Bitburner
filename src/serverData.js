/** @type {NS} */
var ns;
const file = "data.js"

import * as servers from "servers"

export const data = servers.data;

export function init(ns_)
{
	servers.init(ns = ns_)
	if(ns.fileExists(file)) Object.assign(data, load())
}

export function update()
{
	data.cracks = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe']
	data.crackNo = data.cracks.map(f => ns.fileExists(f)).reduce((a,b) => a + b)
	data.hackLv = ns.getHackingLevel();
}

export function addServer(name) {
	data.servers[name] = new CServer(name)
	save();
	return data.servers[name]
}

export function getData(name) { return data }

export function getServer(name = '') {
	return name ? data.servers[name] : Object.values(data.servers)
}

function save() { ns.write(file, '_=' + JSON.stringify(data, null, "  "), "w") }
/** @return {CServer} */
function load() { return JSON.parse(ns.read(file).replace(/^.=/, '')) }

class CServer // : BBServer
{
	constructor(name) {
		// super()
		this.name = name;
		this.path = [];
		this.root = ns.hasRootAccess(name);
		this.maxMoney = ns.getServerMaxMoney(name);
		this.maxRam = ns.getServerMaxRam(name);
		this.growth = ns.getServerGrowth(name);
		this.minSecLvl = ns.getServerMinSecurityLevel(name);
		this.reqPorts = ns.getServerNumPortsRequired(name);
		this.reqHackLvl = ns.getServerRequiredHackingLevel(name);
	}
}