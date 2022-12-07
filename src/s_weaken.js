
/** @param {NS} ns */
export async function main(ns)
{
	const name = String(ns.args[0])
	const threads = Number(ns.args[1])
	await ns.weaken(name, { threads });
}