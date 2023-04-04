
/** @param {NS} ns */
export async function main(ns)
{
    await ns.asleep(1e3);
    const threads = Number(ns.args.splice(1, 1)) || 1;
    const pid = ns.run(String(ns.args[0]), threads, ...ns.args.slice(1));
    if (!pid) ns.tprint(`ERROR ${threads}x ${ns.args.join(' ')}`);
}