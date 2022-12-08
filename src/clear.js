
/** @param {NS} ns */
export async function main(ns)
{
    const spat = ns.args.filter(s => String(s)[0] != '-')[0]
    const pat = RegExp(spat ? String(ns.args[0]) : ".*")
    for (const s of scanServerNames(ns).slice(1).filter(s => pat.test(s) && ns.hasRootAccess(s)))
    {
        ns.tprint(s)
        if (ns.args.includes("-k")) ns.killall(s);
        if (ns.args.includes("-c")) clear(ns, s);
        if (ns.args.includes("-x")) copy(ns, s);
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
export function clear(ns, s)
{
	for (const f of ns.ls(s))
		if (f.endsWith('.js') || f.endsWith('.txt'))
			ns.rm(f, s) || err(ns, "rm " + f);
}

/** @type {(ns:NS, s:string) => void} */
export function copy(ns, s)
{
	const files = [
		'mine.js', 'util.js',
		'servers.js', 'data.txt',
		's_weaken.js', 's_grow.js', 's_hack.js'
	];

	if (s == "home") return;
	for (const f of files)
	{
		if (ns.fileExists(f, s)) ns.rm(f, s) || err(ns, "rm " + f);
		ns.scp(f, s) || err(ns, "copy " + f)
	}
}

/** @type {(ns:NS, s:string) => void} */
function err(ns, s) { ns.tprint(`  ERROR: ${s}`); }

/** @type {(ns:NS, s:string) => void} */
function wrn(ns, s) { ns.tprint(`  WARNING: ${s}`); }
