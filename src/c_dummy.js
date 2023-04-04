
/** @param {NS} ns */
export async function main(ns)
{
	if (!ns.args[0]) return ns.tprint("ERROR missing contract type");
	const n = ns.args[1] == '-S' ? Number(ns.args[2]) || 10 : 1;
	for (const f of ns.ls('home', '.cct')) ns.rm(f);
	for (var i = 0; i < n; i++)
		ns.codingcontract.createDummyContract(String(ns.args[0]));
	const list = ns.ls('home', '.cct');
	ns.tprint(list.join(' '));
	//for (const f of list)
	//	ns.tprint('INFO ' + ns.codingcontract.getDescription(f, 'home'));
}