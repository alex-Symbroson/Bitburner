
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
	cracks = ['brutessh.exe', 'ftpcrack.exe', 'relaysmtp.exe', 'httpworm.exe', 'sqlinject.exe']

	hackLv = 0;
	crackNo = 0;
	srvLimit = 0;
}

/** @param {NS} ns */
export function load(ns)
{
	return JSON.parse(String(ns.read(file)).replace(/^.=/, ''))
}