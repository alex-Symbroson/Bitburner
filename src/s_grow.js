
/** @param {NS} ns */
export async function main(ns)
{
	const name = String(ns.args[0])
	const threads = Number(ns.args[1])
	const time = Number(ns.args[2]);
	if (time) await ns.asleep(time - Date.now());
	await ns.grow(name, { threads });
}