import { clearFlag, getFlag, setFlag } from "./constants";
import { fn2, logn, Timer } from "./util";

// max no of 1 server type
const MAX_SERVERS = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5];
const MAX_SERVERS_DFLT = 5;

/** @type {Server[]} */
let servers = []
let tPurch = new Timer();
let tBump = new Timer();
let ramLvl = 4; // hack script size
let srvLimit = 0; // getPurchasedServerLimit
let maxRam = 1; // max getPurchasedServerCost != infinity

/** @param {NS} ns */
export async function main(ns)
{
    const pid = ns.ps().find(v => v.pid != ns.pid && v.filename == 'purchase.js')?.pid;
    srvLimit = ns.getPurchasedServerLimit();
    while (ns.getPurchasedServerCost(2 << maxRam) != Infinity) maxRam++;

    // purchased server list
    servers = ns.getPurchasedServers()
        .map(s => ns.getServer(s))
        .sort((a, b) => a.maxRam - b.maxRam);

    if (ns.args[0] == "-k") setFlag(ns, 'P');
    if (ns.args[0] == "-d") clearFlag(ns, 'P');

    if (ns.args[0] == "-i") ns.tprint(ns.getPurchasedServerCost(Number(ns.args[0])).toExponential(2));
    else if (ns.args[1] == "-p") ns.purchaseServer(String(ns.args[2]), Number(ns.args[0]));
    else if (ns.args[0] == "-k") ns.kill(pid) ? ns.tprint('killed purchase.js') : ns.tprint('ERROR failed killing purchase.js');
    else if (String(ns.args[0]).toLowerCase() == "-d" && pid) ns.tprint('WARNING purchase.js already running');
    else await daemon(ns);
}

/** @param {NS} ns **/
async function daemon(ns)
{
    let counts = getCount(servers);

    // execute getCount before!
    const ramBump = (print = false) =>
    {
        ramLvl++;
        const cost = ns.getPurchasedServerCost(1 << ramLvl);
        if (print) ns.tprint(`WARN ram bump ${getRamStr(ns, 1 << ramLvl - 1)} -> ${getRamStr(ns, 1 << ramLvl)} (${tBump.next()}s) ${fn2(cost)}`);
        if (!ns.args.length) return;
        if (print) printCount(ns, counts, ramLvl);

        if (ramLvl > 16 || counts[1 << 15] > 1) setFlag(ns, 'HGW');
        else clearFlag(ns, 'HGW');
    }

    // update ramLvl to greatest purchased server
    if (servers.length > 0) ramLvl = logn(servers[servers.length - 1].maxRam, 2);
    if (ramLvl > 16 || counts[1 << 15] > 1) setFlag(ns, 'HGW');
    else clearFlag(ns, 'HGW');

    // general info
    if (!(ns.args.includes('-s') || ns.args.includes('-d')))
    {
        ns.tprint(`${servers.length} servers, ${ramLvl}/${maxRam} ram`);
        printCount(ns, counts, ramLvl);
    }

    // flush port
    ns.clearPort(2);

    while (servers.length < 25 || servers[0].maxRam < 1 << maxRam)
    {
        // flag set by augments some time before installing
        if (ns.args.includes('-s') && getFlag(ns, 'P')) return;
        // sleep while Formula.exe is bought
        if (ns.isRunning('tor.js', 'home', '-t'))
        {
            if (ns.args.includes('-D')) return;
            if (ns.args.includes('-d')) await ns.asleep(10e3);
            continue;
        }

        const p = ns.getPlayer();
        let ram = Math.min(1 << maxRam, 1 << ramLvl);
        let cost = ns.getPurchasedServerCost(ram);

        if (ramLvl < maxRam)
        {
            counts = getCount(servers);
            // skip ram level when money is significantly greater
            while (p.money > 4 * ns.getPurchasedServerCost(1 << ramLvl)) ramBump(p.money >= cost * 2);
            // skip ram level when reached max of single server type
            if (counts[1 << ramLvl] >= (MAX_SERVERS[ramLvl] || MAX_SERVERS_DFLT)) ramBump(p.money >= cost * 2);
        }
        if (!ns.args.length) return;
        ram = Math.min(1 << maxRam, 1 << ramLvl);
        cost = ns.getPurchasedServerCost(ram);

        if (p.money < cost)
        {
            if (ns.args.includes('-D')) return;
            if (ns.args.includes('-d')) await ns.asleep(10e3);
        }
        else if (servers.length == srvLimit)
        {
            ns.writePort(1, `sd ${servers[0].hostname}`);
            let i = 20 * (1000 / 200);
            do
            {
                await ns.asleep(200);
                if (!i--) ns.toast("purchase.js waiting for delete response", "warning", 30e3);
            } while (ns.readPort(2) != "registered");

            ns.killall(servers[0].hostname);
            ns.deleteServer(servers[0].hostname);
            servers.shift();
        }
        else
        {
            const sname = ns.purchaseServer("server", ram);
            if (!sname) continue;
            const s = ns.getServer(sname);
            ns.writePort(1, `sa ${s.hostname}`);
            servers.push(s);
            counts = getCount(servers);
            printCount(ns, counts, ramLvl, s.hostname);
        }
    }

    ns.tprint("WARN maxed on servers, terminated");
}

/** @type {(ns:NS, servers:{[x:string]:number}, ramLvl?:number, newserv?:string) => void} */
function printCount(ns, counts, ramLvl, newserv = '')
{
    if (newserv) newserv += `  (${tPurch.next()}s)`;
    const info =
        `INFO ${ramLvl}/${maxRam} [$${fn2(ns.getPurchasedServerCost(1 << ramLvl))}]: ` +
        Object.keys(counts).map(k => `${counts[k]} ${getRamStr(ns, Number(k))}`).join(", ");
    if (newserv) ns.tprint(info + ' ' + newserv);
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