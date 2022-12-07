
import * as srvd from "./serverData";
import { BBServerData } from "./servers";
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
    let multi = 2; // hack script size

    const servers = ns.getPurchasedServers().map(s => data.servers[s]);

    if (servers.length > 0)
    {
        const rams = servers.map(s => s.maxRam);
        multi = logn(Math.max.apply(null, rams), 2)
    }

    const queue = [...servers].sort((a, b) => a.maxRam - b.maxRam);
    ns.tprint(queue.map(s => fn2(s.maxRam)).join(", "))
    ns.tprint(`${queue.length} servers, ${multi}/${maxRam} ram`)

    let nameCounter = 1;
    while (multi < maxRam)
    {
        const p = ns.getPlayer();
        const ram = Math.min(1 << 20, 1 << multi);
        const cost = ns.getPurchasedServerCost(ram);

        await ns.asleep(1000);
        if (p.money < cost) await ns.asleep(1000);
        else if (queue.length >= data.srvLimit)
        {
            if (queue[0].maxRam >= 1 << multi)
            {
                ns.tprint(`ram bump ${fn2(ram)} -> ${fn2(ram + 1)}`);
                multi++;
                continue;
            }
            else
            {
                ns.tprint(`delete ${fn2(queue[0].maxRam)} server ${queue[0].name}`);
                ns.writePort(1, `sd ${queue[0].name}`)
                await ns.asleep(1000);
                ns.killall(queue[0].name);
                ns.deleteServer(queue[0].name);
                queue.shift();
                ns.tprint(queue.map(s => fn2(s.maxRam)).join(", "))
            }
        }
        else
        {
            const name = baseName + nameCounter++;
            ns.tprint(`purchase ${fn2(ram)} server ${name} for ${fn2(cost)}`);
            const sname = ns.purchaseServer(name, ram);
            const s = new srvd.CServer(sname);
            ns.writePort(1, `sa ${s}`);
            queue.push(s);
            ns.tprint(queue.map(s => fn2(s.maxRam)).join(", "));
        }
    }
    ns.tprint("maxed on servers, terminated");
}
