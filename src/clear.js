// for i in t_*; do i=${i/.js/}; echo "${i/t_/}"; grep -nE "\"${i/t_/}\"" *; done

/** @param {NS} ns */
export async function main(ns)
{
    const spat = ns.args.filter(s => String(s)[0] != '-')[0]
    const pat = RegExp(spat ? String(ns.args[0]) : ".*")
    const srvs = scanServerNames(ns).slice(1).filter(s => pat.test(s) && ns.hasRootAccess(s));

    if (ns.args.includes("-f")) rmall(ns, "home");
    else for (const s of srvs)
    {
        if (!ns.args.length || ns.args.includes("-k")) ns.killall(s);
        if (!ns.args.length || ns.args.includes("-x")) clear(ns, s);
        if (!ns.args.length || ns.args.includes("-c")) copy(ns, s);
        await ns.sleep(10);
    }
    ns.tprint(`processed ${srvs.length} servers`)
}

/** @param {NS} ns */
export function scanServerNames(ns)
{
    const list = ["home"];
    for (var n = 0, i = 999; i-- && n < list.length; n++)
        list.push(...ns.scan(list[n]).filter(s => !list.includes(s)));
    if (i >= 999) ns.tprint("WARN scanServer loop limit reached")
    return list;
}

/** @type {(ns:NS, s:string) => void} */
export function clear(ns, s)
{
    for (const f of ns.ls(s))
        if (f.endsWith('.js') || f.endsWith('.txt'))
            ns.rm(f, s) || ns.tprint('ERROR rm ' + f);
}

/** @type {(ns:NS, s:string) => void} */
export function copy(ns, s)
{
    const files = ['s_weaken.js', 's_grow.js', 's_hack.js'];
    if (s == "home") return;
    for (const f of files)
    {
        // if (ns.fileExists(f, s)) ns.rm(f, s) || err(ns, "rm " + f);
        ns.scp(f, s) || ns.tprint('ERROR copy ' + f)
    }
}

/** @type {(ns:NS, s:string) => void} */
export function rmall(ns, s)
{
    ns.tprint(ns.ls(s, ".js"));
    for (var f of ns.ls(s, ".js")) ns.rm(f) && ns.tprint("deleted " + f);
}