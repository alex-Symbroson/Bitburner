
/** @param {NS} ns */
export function scanServerNames(ns)
{
	const list = ["home"];
	for (var n = 0, i = 999; i-- && n < list.length; n++)
		list.push(...ns.scan(list[n]).filter(s => !list.includes(s)));
	if (i >= 999) ns.tprint("WARNING: scanServer loop limit reached")
	return list;
}