
/** @type {NS} */ var ns;
export const file = "data.txt"

export class BBServer
{
	name = "";
	root = false
	path = ["."]
	maxMoney = 0
	maxRam = 0
	growth = 0
	minSecLvl = 0
	reqPorts = 0
	reqHackLvl = 0

	moneyAvail = 0
	secLvl = 0
	lastMoney = 0
}

export class BBServerData
{
	/** @type {{[x:string]:BBServer}} */
	servers = {};
	/** @type {BB.PurchaseableProgram[]} */
	cracks = ['brutessh.exe', 'ftpcrack.exe', 'relaysmtp.exe', 'httpworm.exe', 'sqlinject.exe']

	hackLv = 0;
	crackNo = 0;
}

/** @type {BBServerData} */
export const data = new BBServerData();

/** @param {NS} _ns */
export function init(_ns)
{
	ns = _ns
	if (ns.fileExists(file)) Object.assign(data, load())
	return data
}

function load()
{
	return JSON.parse(String(ns.read(file)).replace(/^.=/, ''))
}

/** @type {(d:string|BBServer) => boolean} */
export function rootable(d)
{
	if (typeof d === "string") d = data.servers[d]
	return d.reqHackLvl <= data.hackLv && d.reqPorts <= data.crackNo
}