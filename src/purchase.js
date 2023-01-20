import * as srvd from "./serverData";
import { BBServerData } from "./servers";
import { fn2, logn } from "./util";

/** @type {Partial<BBServerData>} */
let data = {};

/** @param {NS} ns */
export async function main(ns)
{
    data = srvd.init(ns);
    if (ns.args[0] == "-i") ns.tprint(ns.getPurchasedServerCost(Number(ns.args[0])).toExponential(2));
    else if (ns.args[1] == "-p") ns.purchaseServer(String(ns.args[2]), Number(ns.args[0]));
    else if (ns.args[0] == "-k") ns.kill('purchase.js', 'home', '-d') && ns.tprint('SUCCESS killed purchase.js');
    else if (ns.args[0] == "-d") await daemon(ns);
    else {
        const servers = ns.getPurchasedServers()
            .map(s => data.servers[s])
            .sort((a, b) => a.maxRam - b.maxRam);
        printCount(ns, servers);
    }
}

/** @param {NS} ns **/
async function daemon(ns)
{
    const maxRam = 20;
    let ramLvl = 4; // hack script size

    // purchased server list
    const servers = ns.getPurchasedServers()
        .map(s => data.servers[s])
        .sort((a, b) => a.maxRam - b.maxRam);
    
    // update ramLvl to greatest purchased server
    if (servers.length > 0)
    {
        const rams = servers.map(s => s.maxRam);
        ramLvl = logn(Math.max.apply(null, rams), 2)
    }

    // skip ram level when money is significantly greater
    const money = ns.getPlayer().money;
    while (ns.getPurchasedServerCost(1 << ramLvl) < money / 4) ramLvl++;

    // general info
    ns.tprint(`${servers.length} servers, ${ramLvl}/${maxRam} ram`)
    printCount(ns, servers)
    // flush port
    while (ns.readPort(2) != "NULL PORT DATA");

    while (ramLvl <= maxRam)
    {
        const p = ns.getPlayer();
        const ram = Math.min(1 << 20, 1 << ramLvl);
        const cost = ns.getPurchasedServerCost(ram);

        await ns.asleep(1000);
        if (p.money < cost) await ns.asleep(5000);
        else if (servers.length >= data.srvLimit)
        {
            if (servers[0].maxRam >= 1 << ramLvl)
            {
                ns.tprint(`WARN ram bump ${fn2(ramLvl)} -> ${fn2(ramLvl + 1)}`);
                ramLvl++;
            }
            else
            {
                ns.writePort(1, `sd ${servers[0].hostname}`);
                while (ns.readPort(2) != "registered") await ns.sleep(1000);

                ns.killall(servers[0].hostname);
                ns.deleteServer(servers[0].hostname);
                servers.shift();
                printCount(ns, servers);
            }
        }
        else
        {
            const sname = ns.purchaseServer("server", ram);
            if (!sname) continue;
            const s = ns.getServer(sname);
            ns.writePort(1, `sa ${s.hostname}`);
            servers.push(s);
            printCount(ns, servers);
        }
    }
    ns.tprint("WARN maxed on servers, terminated");
}

/**
 * @type {(ns:NS, list:Server[]) => void}
 */
function printCount(ns, servers)
{
    const counts = /** @type {{[x:string]: number}} */ ({});
    servers.map(s => s.maxRam).forEach(s => counts[s] = (counts[s] || 0) + 1)
    ns.tprint(Object.keys(counts).map(k => `${counts[k]} ${fn2(Number(k))} [${fn2(ns.getPurchasedServerCost(Number(k)))}]`).join(", "))
}
