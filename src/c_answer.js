
/** @param {NS} ns */
export async function main(ns)
{
	ns.tprint(ns.args)
	const answer = JSON.parse(String(ns.args[0]));
	const res = ns.codingcontract.attempt(answer, String(ns.args[1]), String(ns.args[2] || 'home'));
	if (res) ns.tprint('WARN ' + res);
	else ns.tprint("ERROR answer is wrong!");
}
