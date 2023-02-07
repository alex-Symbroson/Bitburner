
/** @param {NS} ns */
export async function main(ns)
{
	ns.singularity.connect("home")
	for (const s of ns.args) 
		if (!ns.singularity.connect(String(s)))
			return ns.tprint("ERROR: connect " + s)
	await ns.singularity.installBackdoor();
	ns.singularity.connect("home");
	ns.tprint(`INFO ${ns.args.pop()} done.`);
}
