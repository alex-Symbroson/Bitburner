import { copy } from "./clear";
import { clearFlag, setFlag } from "./constants";
import * as srvd from "./serverData";
import { fn, fn2, logn } from "./util";

const DELAY = 20;

const MONEY_THRES_FAC = 0.9;
const SEC_THRES_FAC = 1.2;

const hackSlave = { hostname: "s_grow.js", ram: 1.75 }

/** @param {NS} ns */
export async function main(ns)
{
    srvd.init(ns);
    hackSlave.ram = ns.getScriptRam(hackSlave.hostname);
    const purchasedServers = srvd.getServers(s => s.purchasedByPlayer);

    const servers = srvd.getServers()
        .filter(s => !s.purchasedByPlayer && s.hasAdminRights && s.moneyMax)
        .sort((a, b) => a.moneyMax - b.moneyMax);

    if (ns.args.includes('-i'))
    {
        ns.tprint(`maxRam: ${fn2(getMaxRam())}`);
        ns.tprint(servers.map((s, i) => `${i}: ${fn2(s.moneyMax)} ${s.hostname}`).join('\n'));
        return;
    }

    let tStart = Date.now();
    let n = 0;

    while (true)
    {
        purchasedServers.map(s => srvd.addServer(s.hostname, false));
        while (handleMsg(ns, String(ns.readPort(1))));
        const p = ns.getPlayer();
        const s = srvd.addServer(servers[servers.length - 1].hostname);
        const r = hgwgServer(ns, s, p);
        if (r) n++;
        const dAvg = n < 10 ? 5e3 : 0.95 * Math.min(30 * 60e3, Date.now() - tStart) / n;
        if (Date.now() - tStart > 30 * 60e3)
        {
            const delta = Date.now() - tStart - 30 * 60e3;
            n -= delta / dAvg;
            tStart += delta;
            ns.tprint(`delta corr. ${delta | 0} n ${fn(delta / dAvg)}`)
        }
        await ns.asleep(DELAY + dAvg);
    }
}

/** @type {{[server:string]:number}} */
const primes = {}
let tLast = 0;

// https://www.reddit.com/r/Bitburner/comments/rm48o1
/** @type {(ns:NS, s:Server, p:Player) => boolean} */
function hgwgServer(ns, s, p)
{
    const hf = ns.formulas.hacking;
    const now = Date.now();
    // priming in progress - return
    if (now < (primes[s.hostname] || 0)) return;

    var maxWThreads = Math.min(2000, getMaxRam() / hackSlave.ram) | 0;
    var wThreads = (maxWThreads - ((s.minDifficulty) / 0.05));

    if (primes[s.hostname] !== 0)
    {
        // var maxGrowThreads = ((s.maxRam / hackSlave.ram) - (hackSlave.ram * maxWeakenThreads));
        var maxGThreads = Math.min(getMaxRam() / hackSlave.ram) | 0;
        maxGThreads = Math.min(maxGThreads, hf.growThreads(s, p, s.moneyMax));

        //Priming the server.  Max money and Min security must be acheived for this to work
        if (s.moneyAvailable < s.moneyMax)
        {
            primes[s.hostname] = now + hf.weakenTime(s, p) + 1000;
            const money = `${fn2(s.moneyAvailable)}/${fn2(s.moneyMax)} (${fn(s.moneyAvailable / s.moneyMax, 2, 1)}%)`;
            ns.tprint(`INFO priming ${s.hostname} ${money} for ${fn(primes[s.hostname] - now, -3, 1)}s`);
            const pidw = exec(ns, 's_weaken.js', maxWThreads, s.hostname, maxWThreads, '--');
            const pidg = exec(ns, 's_grow.js', maxGThreads, s.hostname, maxGThreads, '--');
            if (!(pidw && pidg)) delete primes[s.hostname];
            return false;
        }

        //If Max Money is true, making sure security level is at its minimum
        if (s.hackDifficulty > s.minDifficulty && primes[s.hostname] !== 0)
        {
            primes[s.hostname] = now + hf.weakenTime(s, p) + 1000;
            ns.tprint(`INFO prime weaken ${s.hostname} for ${fn(primes[s.hostname] - now, -3, 1)}s`);
            const pidw = exec(ns, 's_weaken.js', maxWThreads, s.hostname, maxWThreads, '--');
            if (!pidw) delete primes[s.hostname];
            return false;
        }
        primes[s.hostname] = 0;
    }

    var HPercent = hf.hackPercent(s, p) * 100;
    var GPercent = hf.growPercent(s, 1, p, 1);
    var WTime = hf.weakenTime(s, p);
    var GTime = hf.growTime(s, p);
    var HTime = hf.hackTime(s, p);

    var gThreads = Math.ceil(logn(2.1, GPercent)); //Math.round(5 / (GPercent - 1)); //Getting the amount of threads I need to grow 200%.  I only need 100% but I'm being conservative here
    var hThreads = Math.ceil(50 / HPercent);  //Getting the amount of threads I need to hack 50% of the funds
    wThreads = Math.ceil(wThreads - (gThreads * 0.004)); //Getting required threads to fully weaken the server

    // HGWG part

    const off = 0; // Math.max(0, tLast - (now + WTime)); // delay operation if OP would end up earlier than last one for lvlUp
    var wsleep = off; //At one point I made the weaken call sleep so I've kept it around
    var gsleep = off + WTime - GTime - DELAY / 4; //Getting the time to have the Growth execution sleep, then shaving some off to beat the weaken execution
    var hsleep = off + WTime - HTime - DELAY / 2; //Getting time for hack, shaving off more to make sure it beats both weaken and growth
    // tLast = now + off + wsleep + WTime;

    //const tw = `${wThreads}:${fn(wsleep, -3, 2)}:${fn(wsleep + WTime, -3, 2)}`;
    //const tg = `${gThreads}:${fn(gsleep, -3, 2)}:${fn(gsleep + GTime, -3, 2)}`;
    //const th = `${hThreads}:${fn(hsleep, -3, 2)}:${fn(hsleep + HTime, -3, 2)}`;
    // ns.tprint(`INFO hgw batch ${s.hostname} ${tw} ${tg} ${th}`);

    const n = 1 + Math.random() * 9998 | 0;
    const pids = [
        exec(ns, 's_weaken.js', wThreads, s.hostname, wThreads, now + wsleep, '--', n),
        exec(ns, 's_grow.js', gThreads, s.hostname, gThreads, now + gsleep, '--', n),
        exec(ns, 's_hack.js', hThreads, s.hostname, hThreads, now + hsleep, '--', n)
    ];
    if (pids.includes(0))
    {
        pids.map(pid => pid && ns.kill(pid));
        return false;
    }
    return true;
}

/** @type {(ns:NS, script:string, threads:number, ...args:any[]) => number} */
function exec(ns, script, threads, ...args)
{
    const ram = threads * ns.getScriptRam(script);
    const servers = srvd.getServers(s => s.purchasedByPlayer && s.hostname != 'home')
        .sort((a, b) => (a.maxRam - a.ramUsed) - (b.maxRam - b.ramUsed));
    const server = servers.find(s => s.maxRam - s.ramUsed > ram);

    if (!server)
    {
        if (Object.values(primes).find(n => n != 0))
            ns.tprint(`ERROR maxRam: ${fn2(ram)}/${fn2(servers.reverse()[0].maxRam)} for ${threads} * ${script}`);
        return 0;
    }

    const pid = ns.exec(script, server.hostname, threads, ...args);
    if (pid) srvd.addServer(server.hostname);
    else ns.tprint(`ERROR exec ${server.hostname} ${threads} * ${script} ${args.join(' ')} failed`);
    return pid;
}

/** @return {number} */
function getMaxRam()
{
    return Math.max.apply(null, srvd.getServers(s => s.purchasedByPlayer).map(s => s.maxRam));
}

/** @type {(ns:NS, s:string) => boolean} */
function handleMsg(ns, s)
{
    if (s == "NULL PORT DATA") return false;

    const m = s.split(/\s+/);
    switch (m[0])
    {
        case "sd":
            srvd.rmServer(m[1]);
            ns.writePort(2, "registered");
            break;
        case "sa": registerMiner(ns, m[1]); break;
        default: throw Error(`unhadled msg cmd '${m[1]}`);
    }

    return true;
}

/** @type {(ns:NS, s:string) => void} */
function registerMiner(ns, s)
{
    copy(ns, s);
    srvd.addServer(s);
}