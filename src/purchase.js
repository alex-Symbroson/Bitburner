
import { mine } from "./autorun";
import * as srvd from "./serverData";
import * as srv from "./servers";
import { fn2, logn } from "./util";
const sd = srv.data;

export const purchaseConf = {
    nameCounter: 1,
    multi: 4,
    maxRam: 20,
    hackScript: "mine.js",
    baseName: "server",
    /** @type {srv.BBServer[]} */
    queue: []
}

/** @param {NS} ns */
export async function main(ns)
{
    srv.init(ns)
    srvd.init(ns)
    if (ns.args[0] == "-i") ns.tprint(ns.getPurchasedServerCost(Number(ns.args[0])).toExponential(2))
    else if (ns.args[1] == "-p") ns.purchaseServer(String(ns.args[2]), Number(ns.args[0]))
    else if (ns.args[0] == "-d") await daemon(ns)
}

/** @param {NS} ns **/
async function daemon(ns)
{
    const servers = ns.getPurchasedServers().map(s => sd.servers[s]);
    const conf = purchaseConf;

    if (servers.length > 0)
    {
        const rams = servers.map(s => s.maxRam);
        conf.multi = logn(Math.max.apply(null, rams), 2);
    }

    const queue = [...servers].sort((a, b) => a.maxRam - b.maxRam);
    ns.tprint(queue.map(s => fn2(s.maxRam)).join(", "))
    ns.tprint(`${queue.length} servers, ${conf.multi}/${conf.maxRam} ram`)

    while (conf.multi < conf.maxRam)
    {
        await ns.asleep(1000);
        tryPurchase(ns, conf)
    }
    ns.tprint("maxed on servers, terminated");
}

/**
 * @param {NS} ns
 * @param {typeof purchaseConf} c
 */
export async function tryPurchase(ns, c)
{
    const p = ns.getPlayer();
    const ram = Math.min(1 << 20, 1 << c.multi);
    const cost = ns.getPurchasedServerCost(ram);

    if (p.money < cost) 0;
    else if (c.queue.length >= sd.srvLimit)
    {
        if (c.queue[0].maxRam >= 1 << c.multi)
        {
            ns.tprint(`ram bump ${fn2(ram)} -> ${fn2(ram + 1)}`);
            c.multi++;
        }
        else
        {
            ns.tprint(`delete ${fn2(c.queue[0].maxRam)} server ${c.queue[0].name}`);
            ns.writePort(1, `d ${c.queue[0].name}`)
            await ns.asleep(1000);
            ns.killall(c.queue[0].name);
            ns.deleteServer(c.queue[0].name);
            c.queue.shift();
            ns.tprint(c.queue.map(s => fn2(s.maxRam)).join(", "))
        }
    }
    else
    {
        const name = c.baseName + c.nameCounter++;
        ns.tprint(`purchase ${fn2(ram)} server ${name} for ${fn2(cost)}`);
        const s = new srvd.CServer(ns.purchaseServer(name, ram));
        ns.writePort(1, `a ${s}`)
        c.queue.push(s);
        ns.tprint(c.queue.map(s => fn2(s.maxRam)).join(", "))

        mine(s)
    }
}