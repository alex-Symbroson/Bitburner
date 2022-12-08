
import * as servers from "./servers";
import * as utilx from "./utilx";

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


export function scanServerNames()
{
    const list = ["home"];
    for (var n = 0, i = 999; i-- && n < list.length; n++)
        list.push(...ns.scan(list[n]).filter(s => !list.includes(s)));
	if (i >= 999) ns.tprint("WARNING: scanServer loop limit reached")
    return list;
}

export function scanServerPath(name = "home")
{
    const path = [name], list = ["home"], pre = /** @type {{[x:string]:string}} */ ({});
	for (var n = 0, i = 999; i-- && n < list.length; n++)
	{
		const scan = ns.scan(list[n]).filter(s => !list.includes(s))
		for (const s of scan) list.push(s), pre[s] = list[n];
		if (list[n] == name) break;
	}
		
	while (pre[name] != "home") path.push(pre[name]), name = pre[name];
	if (i >= 999) ns.tprint("WARNING: scanServer loop limit reached")
	return path.reverse()
}

export function scanServers()
{
    const list = scanServerNames().map(s => addServer(s, false))
	return (saveData(), list)
}

/** @type {(name:string, save:boolean, bdoor:boolean) => NSServer} */
export function addServer(name, save = true, bdoor = false)
{
	data.servers[name] = ns.getServer(name)
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


/** @type {(s:string|NSServer) => boolean} */
export function rootable(s)
{
	if (typeof s === "string") s = data.servers[s]
	return data.hackLv >= s.requiredHackingSkill && data.crackNo >= s.numOpenPortsRequired
}

/** @type {() => servers.BBServerData} */
export const getData = () => data

/** @type {(name:string) => NSServer} */
export const getServer = name => data.servers[name]

/** @type {(filter?: (s: NSServer) => boolean) => NSServer[]} */
export const getServers = (filter = a => true) => 
	Object.values(data.servers).filter(filter);

const saveData = () => utilx.save(servers.file, data);
