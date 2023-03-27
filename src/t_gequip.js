
/** @param {NS} ns */
export async function main(ns)
{
    // @ts-ignore
    ns.gang.purchaseEquipment(String(ns.args[0]), String(ns.args[1]));
}