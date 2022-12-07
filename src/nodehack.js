
// Credit: https://github.com/MysticBanana

// Money that will be left always after a bought
var reserveMoney = 1e9;

/** @param {NS} ns */
export async function main(ns)
{
    while (true)
    {
        ns.hacknet.purchaseNode();
        buy_upgrade(ns);
        await ns.sleep(500);
    }
}

/** @type {(ns:NS, cost:number) => boolean} ns */
function can_purchase(ns, cost)
{
    return cost + reserveMoney < ns.getServerMoneyAvailable("home")
}

/** @param {NS} ns */
function buy_upgrade(ns)
{
    var num_purchase_level = 4;

    for (var i = 0; i < ns.hacknet.numNodes(); i++)
    {
        if (can_purchase(ns, ns.hacknet.getCoreUpgradeCost(i, 1)))
            var n = ns.hacknet.upgradeCore(i, 1);
        else if (can_purchase(ns, ns.hacknet.getRamUpgradeCost(i, 1)))
            var n = ns.hacknet.upgradeRam(i, 1);
        else if (can_purchase(ns, ns.hacknet.getLevelUpgradeCost(i, num_purchase_level)))
            var n = ns.hacknet.upgradeLevel(i, num_purchase_level);
        else
            ns.print("cant buy");
    }
}