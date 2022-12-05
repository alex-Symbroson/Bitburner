/** @type {NS} */
var ns;
const file = "data.js"

/** @type {BBServerData} */
export const data = {}

export function init(ns_) {
	ns = ns_
	return Object.assign(data, JSON.parse(ns.read(file).replace(/^.=/, '')))
}

export function rootable(d)
{
	if(typeof d === "string") d = data[d]
	return d.reqHackLvl <= data.hackLv && d.reqPorts <= data.crackNo
}

export class BBServer
{
	name = "";
	root = 0
	maxMoney = 0
	maxRam = 0
	growth = 0
	minSecLvl = 0
	reqPorts = 0
	reqHackLvl = 0
}

export class BBServerData
{
	/** @type {{[x:string]:BBServer}} */
	servers = {};
	hackLv 
}