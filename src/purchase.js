/** @param {NS} ns */
export async function main(ns) {
    ns.tprint(ns.getPurchasedServerCost(ns.args[0]).toExponential(2))
    if(ns.args[1] == "-p") ns.purchaseServer(ns.args[2], ns.args[0])
}