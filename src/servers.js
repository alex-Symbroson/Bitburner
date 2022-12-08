
export const file = "data.txt"

export class BBServerData
{
	/** @type {{[x:string]:NSServer}} */
	servers = {};

	hackLv = 0;
	crackNo = 0;
	srvLimit = 0;
}

/** @param {NS} ns */
export const load = ns => JSON.parse(String(ns.read(file)).replace(/^.=/, ''))