
import { closeWeights, fn, fn2, selectWeighted } from "./util";
import * as utilx from "./utilx";

/** @type {NS}    */ var ns;

const minThreads = 128; // minimum thread batch size per server
const numProc = 32; // maximum procs (thread batches) per server
const maxSame = 25; // max procs targeting same server+action

export const hackSlave = { hostname: "s_grow.js", ram: 1.75 }

let weighted = false;
/** @type {SStats} */
let _stats = { idle: 0, all: null, active: {} };   // ovrd from autorun

/** @type {(ns:NS, stats:SStats) => void} _ns */
export function init(_ns, stats)
{
    utilx.init(ns = _ns);
    _stats = stats;
    if (ns.args.includes('-w')) weighted = true;
    hackSlave.ram = ns.getScriptRam(hackSlave.hostname)
}

/** @type {(s: Server, svList: Server[]) => number} */
export function slave(host, svList)
{
    const rootedServers = svList.filter(s => s.hostname != 'home')
    const moneyServers = rootedServers.filter(s => s.moneyMax)
    if (!moneyServers.length) return;

    const weightedServers = !weighted ? moneyServers.map(e => ({ e, w: 1 })) :
        closeWeights(moneyServers, s => s.maxRam, host.maxRam, 5)
    return mine(host, hackSlave.ram, (t, n) => enslave(host, weightedServers, t, n))
}

/** @type {(host: Server, ws: {e:Server, w:number}[], t: number, n: number) => number} */
function enslave(host, ws, threads, n)
{
    const moneyThreshFac = 0.9;
    const secThreashFac = 1.5;

    const t = selectWeighted(ws, s => s.w).e;
    const moneyThresh = t.moneyMax * moneyThreshFac;
    const secThresh = t.minDifficulty * secThreashFac;

    /** @type {SAction} */
    var action = "hack"
    if (t.hackDifficulty > secThresh) action = "weaken"
    else if (t.moneyAvailable < moneyThresh) action = "grow"
    else action = "hack"

    // if (_stats.active[t.hostname][action].length >= maxSame) return (_stats.idle++, -1)
    
    const fMoney = ` ${fn2(t.moneyAvailable)}/${fn2(moneyThresh)}/${fn2(t.moneyMax)} `;
    const fSec = ` ${t.hackDifficulty|0}/${secThresh|0}/${t.minDifficulty|0} `;
    const xargs = [fMoney, fSec].join(", ")

    const pid = ns.exec(`s_${action}.js`, host.hostname, threads, t.hostname, threads, '--', xargs, n);
    _stats.active[t.hostname][action].push(pid);
    _stats.all[action].push(pid);
    return pid;
}

/** @param {Server} s */
const getAvail = s => (s.maxRam / (s.hostname == 'home' ? 1.2 : 1) - ns.getServerUsedRam(s.hostname));

/** @type {(s: Server, ram: number, exec: (threads: number, n: number) => number) => number} */
function mine(s, ram, exec)
{
    var threads = Math.floor(getAvail(s) / ram);
    const buf = Math.max((s.maxRam / (numProc * ram)) | 0, minThreads)
    if (threads <= 0) return;

    var n = threads / buf | 0;
    var errs = 0;
    // ns.tprint(`starting ${n}buf + ${threads - n * buf} on ${s.hostname} [${threads}]`);

    const execerr = (x = 0) =>
        utilx.err(`exec ${errs++, x} ${threads} ${s.hostname} ${threads * ram}/${fn(getAvail(s), 0, 2)}`)

    if (!n)
        exec(threads, 0) || execerr(2)
    else while (n--)
    {
        threads -= buf;
        exec(buf, 1 + Math.random() * 9998 | 0) || execerr(1)
    }
    return errs;
}