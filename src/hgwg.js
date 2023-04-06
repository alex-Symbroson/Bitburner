import { copy } from "./clear";
import * as srvd from "./serverData";
import { fn, fn2, logn } from "./util";

const DELAY = 20;
const hackSlave = { hostname: "s_grow.js", ram: 1.75 }

/** @param {NS} ns */
export async function main(ns)
{
    srvd.init(ns);
    hackSlave.ram = ns.getScriptRam(hackSlave.hostname);

    const daemon = ns.args.includes('-d');
    const servers = srvd.getServers()
        .filter(s => !s.purchasedByPlayer && s.hasAdminRights && s.moneyMax)
        .sort((a, b) => a.moneyMax - b.moneyMax);

    if (ns.args.includes('-i'))
    {
        ns.tprint(`maxRam: ${fn2(srvd.getMaxRam())}`);
        ns.tprint(servers.map((s, i) => `${i}: ${fn2(s.moneyMax)} ${s.hostname}`).join('\n'));
        return;
    }

    let s = servers[servers.length - 1];
    const TIMEFRAME = 10 * 60e3;

    let tStart = Date.now();
    let n = 0;

    if (!hgwgServer(ns, s, ns.getPlayer()))
    {
        ns.toast('preparing HGW', 'warning', 30e3);
        // prepare
        ns.kill('enslave.js');
        for (const s of srvd.getServers(s => s.purchasedByPlayer))
            if (s.hostname != 'home') ns.killall(s.hostname);

        while (!hgwgServer(ns, s, ns.getPlayer())) await ns.asleep(10e3);

        ns.kill('enslave.js', 'home');
        for (const s of srvd.getServers(s => s.purchasedByPlayer))
            if (s.hostname != 'home') ns.killall(s.hostname);
    }

    ns.tprint('WARNING starting HGW');
    while (true)
    {
        while (handleMsg(ns, String(ns.readPort(1))));

        const p = ns.getPlayer();
        const r = hgwgServer(ns, s, p);
        if (r) n++;

        const dAvg = n < 10 ? 200 : Math.min(TIMEFRAME, Date.now() - tStart) / n;
        if (Date.now() - tStart > TIMEFRAME)
        {
            const delta = 1.25 * (Date.now() - tStart - TIMEFRAME);
            n -= delta / dAvg;
            tStart += 2 * delta; // 1:08:30
            // ns.tprint(`delta corr. ${delta | 0} n ${fn(delta / dAvg)}`);
        }
        if (!daemon) return;
        await ns.asleep(DELAY + 0 * dAvg);
    }
}

/** @type {{[server:string]:number}} */
const primes = {}
let tLast = 0;
let nextToast = 0;

// https://www.reddit.com/r/Bitburner/comments/rm48o1
/** @type {(ns:NS, s:Server, p:Player) => boolean} */
function hgwgServer(ns, s, p)
{
    const hf = ns.formulas.hacking;
    const now = Date.now();
    // priming in progress - return
    if (primes[s.hostname] !== 0 && now < (primes[s.hostname] || 0))
    {
        if (now >= nextToast && (nextToast = now + 5 * 60e3))
            ns.tprint(`INFO priming ${fn((primes[s.hostname] - now) / 60, -3, 1)}min`);
        return;
    }

    s = srvd.addServer(s.hostname);
    var maxWThreads = Math.min(2000, srvd.getMaxRam() / hackSlave.ram) | 0;
    var wThreads = (maxWThreads - ((s.minDifficulty) / 0.05));

    const purchasedServers = srvd.getServers(s => s.purchasedByPlayer);
    purchasedServers.map(s => srvd.addServer(s.hostname, false));

    if (primes[s.hostname] !== 0)
    {
        // var maxGrowThreads = ((s.maxRam / hackSlave.ram) - (hackSlave.ram * maxWeakenThreads));
        var maxGThreads = Math.min(srvd.getMaxRam() / hackSlave.ram) | 0;
        maxGThreads = Math.min(maxGThreads, hf.growThreads(s, p, s.moneyMax));

        //Priming the server.  Max money and Min security must be acheived for this to work
        if (s.moneyAvailable < s.moneyMax * 0.97)
        {
            primes[s.hostname] = now + hf.weakenTime(s, p) + 1000;
            const money = `${fn2(s.moneyAvailable)}/${fn2(s.moneyMax)} (${fn(s.moneyAvailable / s.moneyMax, 2, 1)}%)`;
            ns.tprint(`INFO priming ${s.hostname} ${money} for ${fn(primes[s.hostname] - now, -3, 1)}s`);
            const pidw = exec(ns, 's_weaken.js', maxWThreads, s.hostname, maxWThreads, '--');
            const pidg = exec(ns, 's_grow.js', maxGThreads, s.hostname, maxGThreads, '--');
            if (!(pidw && pidg)) delete primes[s.hostname];
            else ns.exec('enslave.js', 'home');
            return false;
        }

        //If Max Money is true, making sure security level is at its minimum
        if (s.hackDifficulty > s.minDifficulty + 0.5)
        {
            primes[s.hostname] = now + hf.weakenTime(s, p) + 1000;
            const diff = `${fn2(s.minDifficulty)}+${fn2(s.hackDifficulty - s.minDifficulty)} (${fn(s.minDifficulty / s.hackDifficulty, 2, 1)}%)`;
            ns.tprint(`INFO prime weaken ${s.hostname} ${diff} for ${fn(primes[s.hostname] - now, -3, 1)}s`);
            const pidw = exec(ns, 's_weaken.js', maxWThreads, s.hostname, maxWThreads, '--');
            if (!pidw) delete primes[s.hostname];
            return false;
        }

        primes[s.hostname] = 0;
        return true;
    }

    var HPercent = hf.hackPercent(s, p) * 100;
    var GPercent = hf.growPercent(s, 1, p, 1);
    var WTime = hf.weakenTime(s, p);
    var GTime = hf.growTime(s, p);
    var HTime = hf.hackTime(s, p);

    var gThreads = Math.ceil(logn(2, GPercent)); //Math.round(5 / (GPercent - 1)); //Getting the amount of threads I need to grow 200%.  I only need 100% but I'm being conservative here
    var hThreads = Math.floor(50 / HPercent);  //Getting the amount of threads I need to hack 50% of the funds
    wThreads = Math.ceil(wThreads - (gThreads * 0.004)); //Getting required threads to fully weaken the server

    // HGWG part

    const off = 0; // Math.max(0, tLast - (now + WTime)); // delay operation if OP would end up earlier than last one for lvlUp
    var wsleep = off; //At one point I made the weaken call sleep so I've kept it around
    var gsleep = off + WTime - GTime - DELAY / 4; //Getting the time to have the Growth execution sleep, then shaving some off to beat the weaken execution
    var hsleep = off + WTime - HTime - DELAY / 2; //Getting time for hack, shaving off more to make sure it beats both weaken and growth
    if (tLast > now + off + wsleep + WTime) ns.tprint(`overlap +${fn(tLast - (now + off + wsleep + WTime), -3, 0)}s`)
    tLast = now + off + wsleep + WTime;

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
        if (Object.values(primes).find(n => n !== 0))
            ns.tprint(`ERROR maxRam: ${fn2(ram)}/${fn2(servers.reverse()[0].maxRam)} for ${threads} * ${script}`);
        return 0;
    }

    const pid = ns.exec(script, server.hostname, threads, ...args);
    if (pid) srvd.addServer(server.hostname);
    else ns.tprint(`ERROR exec ${server.hostname} ${threads} * ${script} ${args.join(' ')} failed`);
    return pid;
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