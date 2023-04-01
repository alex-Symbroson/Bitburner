import { getFlag } from "./constants";
import { fn2, logn, Timer } from "./util";

// max no of 1 server type
const MAX_SERVERS = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5];
const MAX_SERVERS_DFLT = 5;

let tPurch = new Timer();
let tBump = new Timer();
let srvLimit = 0;
let maxRam = 1;

/** @param {NS} ns */
export async function main(ns)
{
    const pid = ns.ps().find((v, i, l) => v.pid != ns.pid && v.filename == 'purchase.js')?.pid;

    srvLimit = ns.getPurchasedServerLimit();
    while (ns.getPurchasedServerCost(2 << maxRam) != Infinity) maxRam++;

    if (ns.args[0] == "-i") ns.tprint(ns.getPurchasedServerCost(Number(ns.args[0])).toExponential(2));
    else if (ns.args[1] == "-p") ns.purchaseServer(String(ns.args[2]), Number(ns.args[0]));
    else if (ns.args[0] == "-k") ns.kill(pid) ? ns.tprint('killed purchase.js') : ns.tprint('ERROR failed killing purchase.js');
    else if (ns.args[0] == "-d") pid ? ns.tprint('WARNING purchase.js already running') : await daemon(ns);
    else
    {
        const servers = ns.getPurchasedServers()
            .map(s => ns.getServer(s))
            .sort((a, b) => a.maxRam - b.maxRam);
        printCount(ns, getCount(servers));
    }
}

/** @param {NS} ns **/
async function daemon(ns)
{
    let ramLvl = 4; // hack script size

    // purchased server list
    const servers = ns.getPurchasedServers()
        .map(s => ns.getServer(s))
        .sort((a, b) => a.maxRam - b.maxRam);
    let counts = getCount(servers);

    const ramBump = () =>
    {
        ns.tprint(`WARN ram bump ${getRamStr(ns, 1 << ramLvl)} -> ${getRamStr(ns, 1 << ramLvl + 1)} (${tBump.next()}s)`);
        ramLvl++;
        counts = getCount(servers);
        printCount(ns, counts, ramLvl);
    }

    // update ramLvl to greatest purchased server
    if (servers.length > 0)
    {
        const rams = servers.map(s => s.maxRam);
        ramLvl = logn(Math.max.apply(null, rams), 2);
    }

    // general info
    ns.tprint(`${servers.length} servers, ${ramLvl}/${maxRam} ram`);
    printCount(ns, counts, ramLvl);

    // flush port
    while (ns.readPort(2) != "NULL PORT DATA");

    while (servers.length < 25 || servers[0].maxRam < 1 << maxRam)
    {
        // flag set by augments some time before installing
        if (ns.args.includes('-s') && getFlag(ns, 'P')) return;

        // skip ram level when money is significantly greater
        const p = ns.getPlayer();
        while (ramLvl < maxRam && ns.getPurchasedServerCost(1 << ramLvl) < p.money / 4) ramBump();
        if (ramLvl < maxRam && counts[1 << ramLvl] >= (MAX_SERVERS[ramLvl] || MAX_SERVERS_DFLT)) ramBump();

        const ram = Math.min(1 << maxRam, 1 << ramLvl);
        const cost = ns.getPurchasedServerCost(ram);

        if (p.money < cost) await ns.asleep(1e4);
        else if (servers.length == srvLimit)
        {
            ns.writePort(1, `sd ${servers[0].hostname}`);
            while (ns.readPort(2) != "registered") await ns.sleep(1000);

            ns.killall(servers[0].hostname);
            ns.deleteServer(servers[0].hostname);

            const sum = servers.map(s => s.maxRam).reduce((a, b) => a + b, 0);
            servers.shift();
        }
        else
        {
            const sname = ns.purchaseServer("server", ram);
            if (!sname) continue;
            const s = ns.getServer(sname);
            ns.writePort(1, `sa ${s.hostname}`);
            servers.push(s);
        }
    }

    ns.tprint("WARN maxed on servers, terminated");
}

/** @type {(ns:NS, servers:{[x:string]:number}, ramLvl?:number, newserv?:string) => void} */
function printCount(ns, counts, ramLvl, newserv = '')
{
    if (newserv) newserv += `  (${tPurch.next()}s)`;
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    const info =
        `INFO ${sum}/${srvLimit} [${fn2(ns.getPurchasedServerCost(1 << ramLvl))}]: ` +
        Object.keys(counts).map(k => `${counts[k]} ${getRamStr(ns, Number(k))}`).join(", ");
    ns.tprint(info + newserv);
    ns.writePort(20, 'purch§' + info.replace(': ', '§'));
}

/** @param {Server[]} servers */
function getCount(servers)
{
    const counts = /** @type {{[x:string]: number}} */ ({});
    servers.map(s => s.maxRam).forEach(s => counts[s] = (counts[s] || 0) + 1);
    return counts;
}

/** @type {(ns:NS, n:number) => string} */
function getRamStr(ns, n)
{
    return `${Math.log2(n)}`;
}