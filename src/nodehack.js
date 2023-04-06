
// Credit: https://github.com/MysticBanana

/** @param {NS} ns */
export async function main(ns)
{
    while (true)
    {
        buy_upgrade(ns);
        await ns.asleep(5000);
    }
}

/** @type {(ns:NS, cost:number) => boolean} ns */
const can_purchase = (ns, cost) => cost < ns.getPlayer().money / 100

/** @param {NS} ns */
export function buy_upgrade(ns)
{
    var num_purchase_level = 10;
    while (can_purchase(ns, ns.hacknet.getPurchaseNodeCost() / 3))
        ns.hacknet.purchaseNode();

    for (var i = 0; i < ns.hacknet.numNodes(); i++)
    {
        while (can_purchase(ns, ns.hacknet.getCoreUpgradeCost(i, 1)))
            ns.hacknet.upgradeCore(i, 1);
        while (can_purchase(ns, ns.hacknet.getRamUpgradeCost(i, 1)))
            ns.hacknet.upgradeRam(i, 1);
        while (can_purchase(ns, ns.hacknet.getLevelUpgradeCost(i, 1)))
            ns.hacknet.upgradeLevel(i, 1);
    }
}
