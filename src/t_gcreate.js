
/** @param {NS} ns */
export async function main(ns)
{
    ns.gang.createGang(String(ns.args[0]));
    ns.writePort(101, "ok");
}