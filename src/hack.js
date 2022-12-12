import { copy } from "./clear";
import * as srvd from "./serverData";

/** @param {NS} ns */
export async function main(ns)
{
    init(ns);
    checkServer(ns, srvd.getServer(String(ns.args[0])))
}

/** @param {NS} ns */
export function init(ns)
{
	srvd.init(ns);
}

/** @type {(ns: NS, s: Server) => void} s */
export function checkServer(ns, s)
{
	const data = srvd.updateBasic();
	if (s.hostname == "home" || s.purchasedByPlayer || !srvd.rootable(s)) return;
	if (s.openPortCount < data.crackNo) crack(ns, s.hostname);
	if (!s.hasAdminRights) ns.nuke(s.hostname);
	copy(ns, s.hostname);

	if (!s.backdoorInstalled)
	{
		const path = srvd.scanServerPath(s.hostname)
		ns.tprint(`  home;connect ${path.join(";connect ")};backdoor`);
	}
}

/** @type {(ns:NS, s:string) => void} */
export function crack(ns, s)
{
	const crackNo = srvd.updateBasic().crackNo;
	if (crackNo > 0) ns.brutessh(s);
	if (crackNo > 1) ns.ftpcrack(s);
	if (crackNo > 2) ns.relaysmtp(s);
	if (crackNo > 3) ns.httpworm(s);
	if (crackNo > 4) ns.sqlinject(s);
}
