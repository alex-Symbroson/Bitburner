
/** @param {NS} ns */
export async function main(ns)
{
    for (const f of ns.ls('home', '.cct')) ns.rm(f);
	ns.codingcontract.createDummyContract(String(ns.args[0]));
	const list = ns.ls('home', '.cct');
	ns.tprint(list.join(' '));
	//for (const f of list)
	//	ns.tprint('INFO ' + ns.codingcontract.getDescription(f, 'home'));
}