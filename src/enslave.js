import { closeWeights, fn, fn2, selectWeighted } from "./util";
import { SProcStats } from "./classes";
import * as utilx from "./utilx";
import * as hack from "./hack";
import * as srvd from "./serverData";
import { copy } from "./clear";
import { getFlag } from "./constants";

/** @type {NS}    */ var ns;

const MONEY_THRES_FAC = 0.9;
const SEC_THRES_FAC = 1.5;

const minThreads = 128; // minimum thread batch size per server
const numProc = 32; // maximum procs (thread batches) per server
const maxSame = 25; // max procs targeting same server+action

export const hackSlave = { hostname: "s_grow.js", ram: 1.75 }

let weighted = false;
/** @type {SStats} */
const stats = { idle: 0, all: new SProcStats(), active: {} }

/** @param {NS} ns */
export async function main(ns)
{
	const daemon = ns.args.includes('-d');
    init(ns);
    for (var i = 0; ; i++)
    {
        while (handleMsg(ns, String(ns.readPort(1))));
        if (i % 10 == 0) await checkNewServers();
        await enslaveServers();
        if (i % 5 == 0) printStats();
        if (!daemon) return;
        await ns.asleep(2000);
    }
}

async function enslaveServers()
{
    stats.idle = 0;
    const svList = srvd.getServers(s => s.hasAdminRights);

    for (const s of svList)
    {
        if (getFlag(ns, 'HGW') && s.maxRam >= 1 << 15) continue;
        try { srvd.addServer(s.hostname); }
        catch (e) { continue; }
        if (s.maxRam - s.ramUsed < hackSlave.ram) continue;
        slave(s, svList);
        await ns.asleep(10);
    }
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

async function checkNewServers()
{
    for (const s of srvd.scanServers())
    {
        if (s.moneyMax && !stats.active[s.hostname])
            stats.active[s.hostname] = { grow: [], weaken: [], hack: [] }

        hack.checkServer(ns, s);
        await ns.asleep(10);
    }
}

var lastStats = "";
function printStats()
{
    /** @type {{[x in SAction]: number}} */
    const max = { grow: 0, weaken: 0, hack: 0 };

    /** @type {SAction} */ var a;
    for (a in stats.all)
    {
        // grow hack weaken
        const ended = stats.all[a].filter(p => !ns.isRunning(p));
        stats.all[a] = stats.all[a].filter(p => !ended.includes(p));
        for (const s in stats.active)
        {
            stats.active[s][a] = stats.active[s][a].filter(p => !ended.includes(p))
            if (max[a] < stats.active[s][a].length) max[a] = stats.active[s][a].length
        }
    }

    if (JSON.stringify(stats.all) != lastStats)
        ns.print(
            `${stats.all.weaken.length} [${max.weaken}] weakening, ` +
            `${stats.all.grow.length} [${max.grow}] growing, ` +
            `${stats.all.hack.length} [${max.hack}] hacking, ` +
            `${stats.idle} idle`)
    lastStats = JSON.stringify(stats.all);
}

/** @type {(ns:NS) => void} _ns */
export function init(_ns)
{
    srvd.init(ns = _ns);
    hack.init(ns = _ns);
    utilx.init(ns = _ns);
    if (ns.args.includes('-w')) weighted = true;
    hackSlave.ram = ns.getScriptRam(hackSlave.hostname)
}

/** @type {(s: Server, svList: Server[]) => number} */
export function slave(host, svList)
{
    const rootedServers = svList.filter(s => s.hostname != 'home')
    const moneyServers = rootedServers.filter(s => s.moneyMax)
    if (!moneyServers.length) return;

    var errs = 0;
    const weightedServers = !weighted ? moneyServers.map(e => ({ e, w: 1 })) :
        closeWeights(moneyServers, s => s.maxRam, host.maxRam, 5)
    mine(host, hackSlave.ram, (t, n) => enslave(host, weightedServers, t, n) || (errs++, 0));
    return errs;
}

/** @type {(host: Server, ws: {e:Server, w:number}[], t: number, n: number) => number} */
function enslave(host, ws, threads, n)
{
    const t = selectWeighted(ws, s => s.w).e;
    const moneyThresh = t.moneyMax * MONEY_THRES_FAC;
    const secThresh = t.minDifficulty * SEC_THRES_FAC;

    /** @type {SAction} */
    var action = "hack"
    if (t.hackDifficulty > secThresh) action = "weaken"
    else if (t.moneyAvailable < moneyThresh) action = "grow"
    else action = "hack"

    // if (_stats.active[t.hostname][action].length >= maxSame) return (_stats.idle++, -1)

    const fMoney = ` ${fn2(t.moneyAvailable)}/${fn2(moneyThresh)}/${fn2(t.moneyMax)} `;
    const fSec = ` ${t.hackDifficulty | 0}/${secThresh | 0}/${t.minDifficulty | 0} `;
    const xargs = [fMoney, fSec].join(", ")

    const pid = ns.exec(`s_${action}.js`, host.hostname, threads, t.hostname, threads, '--', xargs, n);
    stats.active[t.hostname][action].push(pid);
    stats.all[action].push(pid);
    return pid;
}

/** @param {Server} s */
const getAvail = s => (s.hostname == 'home'
    ? ((s.maxRam > 100 ? s.maxRam - 100 : 0) - ns.getServerUsedRam(s.hostname))
    : (s.maxRam - ns.getServerUsedRam(s.hostname)));

/** @type {(s: Server, ram: number, exec: (threads: number, n: number) => number) => void} */
function mine(s, ram, exec)
{
    var threads = Math.floor(getAvail(s) / ram);
    const buf = Math.max((s.maxRam / (numProc * ram)) | 0, minThreads)
    if (threads <= 0) return;

    var n = threads / buf | 0;
    // ns.tprint(`starting ${n}buf + ${threads - n * buf} on ${s.hostname} [${threads}]`);

    const execerr = (x = 0) =>
        ns.tprint(`ERROR exec ${x} ${threads} ${s.hostname} ${threads * ram}/${fn(getAvail(s), 0, 2)}`)

    if (!n && buf <= minThreads)
        exec(threads, 0) || execerr(2);
    else while (n--)
    {
        threads -= buf;
        if (!exec(buf, 1 + Math.random() * 9998 | 0)) { execerr(1); break; }
    }
}