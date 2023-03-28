
/** @param {NS} ns */
export async function main(ns)
{
    // @ts-ignore
    ns.gang.recruitMember(String(ns.args[0]));
}