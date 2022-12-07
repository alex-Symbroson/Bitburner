
import * as srvd from "./serverData";
import { BBServer, BBServerData } from "./servers";
import { fn2, logn } from "./util";

/** @type {Partial<BBServerData>} */
let data = {};

/** @param {NS} ns */
export async function main(ns)
{
    data = srvd.init(ns);
    if (ns.args[0] == "-i") ns.tprint(ns.getPurchasedServerCost(Number(ns.args[0])).toExponential(2))
    else if (ns.args[1] == "-p") ns.purchaseServer(String(ns.args[2]), Number(ns.args[0]))
    else if (ns.args[0] == "-d") await daemon(ns)
}

/** @param {NS} ns **/
async function daemon(ns)
{
    const baseName = "server";
    const maxRam = 20;
    let ramLvl = 2; // hack script size

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
    while (ns.getPurchasedServerCost(1 << ramLvl) < money / 8) ramLvl++;

    // general info
    ns.tprint(`${servers.length} servers, ${ramLvl}/${maxRam} ram`)
    printCount(ns, servers)
    // flush port
    while (ns.readPort(2) != "NULL PORT DATA");

    let nameCounter = 1;
    while (ramLvl < maxRam)
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
                ns.tprint(`ram bump ${fn2(ram)} -> ${fn2(ram + 1)}`);
                ramLvl++;
            }
            else
            {
                ns.writePort(1, `sd ${servers[0].name}`);
                while (ns.readPort(2) != "registered") await ns.sleep(1000);

                ns.killall(servers[0].name);
                ns.deleteServer(servers[0].name);
                servers.shift();
                printCount(ns, servers);
            }
        }
        else
        {
            const name = baseName + nameCounter++;
            const sname = ns.purchaseServer(name, ram);
            const s = new srvd.CServer(sname);
            ns.writePort(1, `sa ${s.name}`);
            servers.push(s);
            printCount(ns, servers);
        }
    }
    ns.tprint("maxed on servers, terminated");
}

/**
 * @type {(ns:NS, list:BBServer[]) => void} queue
 */
function printCount(ns, queue)
{
    const counts = /** @type {{[x:string]: number}} */ ({});
    queue.map(s => s.maxRam).forEach(s => counts[s] = (counts[s] || 0) + 1)
    ns.tprint(Object.keys(counts).map(k => `${counts[k]} ${fn2(Number(k))} [${fn2(ns.getPurchasedServerCost(Number(k)))}]`).join(", "))
}