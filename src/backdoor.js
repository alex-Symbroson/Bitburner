import { task } from "./utilTask";

/** @param {NS} ns */
export async function main(ns)
{
	ns.singularity.connect("home");
	task(ns, 'spawn', 't_connect.js', 1, 'home');
	for (const s of ns.args)
		if (!ns.singularity.connect(String(s)))
			return ns.tprint("ERROR: connect " + s);
	await ns.singularity.installBackdoor();
	ns.tprint(`INFO ${ns.args.pop()} done.`);
}
