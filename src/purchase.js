import * as srvd from "./serverData";
import { BBServerData } from "./servers";
import { fn, fn2, logn, Timer } from "./util";

/** @type {Partial<BBServerData>} */
let data = {};
let tPurch = new Timer();
let tBump = new Timer();

/** @param {NS} ns */
export async function main(ns)
{
    data = srvd.init(ns);
    if (ns.args[0] == "-i") ns.tprint(ns.getPurchasedServerCost(Number(ns.args[0])).toExponential(2));
    else if (ns.args[1] == "-p") ns.purchaseServer(String(ns.args[2]), Number(ns.args[0]));
    else if (ns.args[0] == "-k") ns.kill('purchase.js', 'home', '-d') && ns.tprint('killed purchase.js');
    else if (ns.args[0] == "-d") await daemon(ns);
    else
    {
        const servers = ns.getPurchasedServers()
            .map(s => data.servers[s])
            .sort((a, b) => a.maxRam - b.maxRam);
        printCount(ns, servers);
    }
}

/** @param {NS} ns **/
async function daemon(ns)
{
    let maxRam = 1;
    let ramLvl = 4; // hack script size

    while (ns.getPurchasedServerCost(2 << maxRam) != Infinity) maxRam++;

    // purchased server list
    const servers = ns.getPurchasedServers()
        .map(s => data.servers[s])
        .sort((a, b) => a.maxRam - b.maxRam);

    const ramBump = () =>
    {
        ns.tprint(`WARN ram bump ${getRamStr(ns, 1 << ramLvl)} -> ${getRamStr(ns, 1 << ramLvl + 1)} (${tBump.next()}s)`);
        ramLvl++;
    }

    // update ramLvl to greatest purchased server
    if (servers.length > 0)
    {
        const rams = servers.map(s => s.maxRam);
        ramLvl = logn(Math.max.apply(null, rams), 2);
    }

    // general info
    ns.tprint(`${servers.length} servers, ${ramLvl}/${maxRam} ram`)
    printCount(ns, servers, ramLvl)

    // flush port
    while (ns.readPort(2) != "NULL PORT DATA");

    while (servers.length < 25 || servers[0].maxRam < 1 << maxRam)
    {
        // skip ram level when money is significantly greater
        const p = ns.getPlayer();
        while (ramLvl < maxRam && ns.getPurchasedServerCost(1 << ramLvl) < p.money / 4) ramBump();

        const ram = Math.min(1 << 20, 1 << ramLvl);
        const cost = ns.getPurchasedServerCost(ram);

        if (p.money < cost) await ns.asleep(1e4);
        else if (servers.length == data.srvLimit)
        {
            // if (ramLvl >= maxRam) break;
            ns.writePort(1, `sd ${servers[0].hostname}`);
            while (ns.readPort(2) != "registered") await ns.sleep(1000);

            ns.killall(servers[0].hostname);
            ns.deleteServer(servers[0].hostname);

            const sum = servers.map(s => s.maxRam).reduce((a, b) => a + b, 0);
            const gainRat = (sum - servers[0].maxRam + ram) / sum - 1;
            // ns.tprint(`purchase dt ${tPurch.next()}s gain: ${fn(gainRat, 2, 1)}%`);
            servers.shift();
        }
        else
        {
            const sname = ns.purchaseServer("server", ram);
            if (!sname) continue;
            const s = ns.getServer(sname);
            ns.writePort(1, `sa ${s.hostname}`);
            servers.push(s);
            printCount(ns, servers, ramLvl, ' + ' + s.hostname);

            if (ramLvl <= maxRam && servers[data.srvLimit * 0.6 | 0]?.maxRam >= 1 << ramLvl) ramBump();
        }
    }

    ns.tprint("WARN maxed on servers, terminated");
}

/** @type {(ns:NS, list:Server[], ramLvl?:number, newserv?:string) => void} */
function printCount(ns, servers, ramLvl, newserv = '')
{
    const counts = /** @type {{[x:string]: number}} */ ({});
    if (newserv) newserv += `  (${tPurch.next()}s)`;
    servers.map(s => s.maxRam).forEach(s => counts[s] = (counts[s] || 0) + 1)
    const info =
        `INFO ${servers.length}/${data.srvLimit} [${fn2(ns.getPurchasedServerCost(1 << ramLvl))}]: ` +
        Object.keys(counts).map(k => `${counts[k]} ${getRamStr(ns, Number(k))}`).join(", ");
    ns.tprint(info + newserv);
    ns.writePort(20, 'purch§' + info);
}

/** @type {(ns:NS, n:number) => string} */
function getRamStr(ns, n)
{
    return `${Math.log2(n)}`;
}