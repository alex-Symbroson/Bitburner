

/** @param {NS} ns */
export async function main(ns)
{
    const pat = RegExp(ns.args[0] ? String(ns.args[0]) : ".*")
    for (const s of scanServerNames(ns).slice(1).filter(s => pat.test(s)))
    {
        ns.tprint(s)
        if (ns.args.includes("-k")) ns.killall(s);
        if (ns.args.includes("-c")) clear(ns, s);
        await ns.sleep(10)
    }
}

/** @param {NS} ns */
export function scanServerNames(ns)
{
    const list = ["home"];
    for (var n = 0, i = 999; i-- && n < list.length; n++)
        list.push(...ns.scan(list[n]).filter(s => !list.includes(s)));
	if (i >= 999) ns.tprint("WARNING: scanServer loop limit reached")
    return list;
}

/** @type {(ns:NS, s:string) => void} */
function clear(ns, s)
{
	for (const f of ns.ls(s))
		if (f.endsWith('.js') || f.endsWith('.txt'))
			ns.rm(f, s) || ns.tprint("error: rm " + f);
}