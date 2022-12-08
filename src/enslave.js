
import { closeWeights, fn, selectWeighted } from "./util";
import * as utilx from "./utilx";

/** @type {NS}    */ var ns;

export const hackSlave = { hostname: "s_grow.js", ram: 1.75 }

let weighted = false;
let _stats = [[0]];   // ovrd from autorun

/** @type {(ns:NS, stats:number[][]) => void} _ns */
export function init(_ns, stats)
{
    utilx.init(ns = _ns);
    _stats = stats;
    if (ns.args.includes('-w')) weighted = true;
    hackSlave.ram = ns.getScriptRam(hackSlave.hostname)
}

/** @type {(s: NSServer, svList: NSServer[]) => void} */
export function slave(host, svList)
{
    const rootedServers = svList.filter(s => s.hostname != 'home')
    const moneyServers = rootedServers.filter(s => s.moneyMax)
    if (!moneyServers.length) return;

    const weightedServers = !weighted ? moneyServers.map(e => ({ e, w: 1 })) :
        closeWeights(moneyServers, s => s.maxRam, host.maxRam, 5)
    mine(host, hackSlave.ram, (t, n) => enslave(host, weightedServers, t, n))
}

/** @type {(host: NSServer, ws: {e:NSServer, w:number}[], t: number, n: number) => number} */
function enslave(host, ws, threads, n)
{
    const moneyThreshFac = 0.9;
    const secThreashFac = 1.5;

    const t = selectWeighted(ws, s => s.w).e;
    const moneyThresh = t.moneyMax * moneyThreshFac;
    const secThresh = t.minDifficulty * secThreashFac;

    ns.print(`money ${t.moneyAvailable.toExponential(2)} / ${moneyThresh.toExponential(2)} / ${t.moneyMax.toExponential(2)})`)
    ns.print(`sec   ${t.hackDifficulty.toFixed(2)} / ${secThresh.toFixed(2)} / ${t.minDifficulty.toFixed(2)})`)
    var pid = 0;

    if (t.hackDifficulty > secThresh)
        pid = ns.exec("s_weaken.js", host.hostname, threads, t.hostname, threads, '--', n) << 2 | 0
    else if (t.moneyAvailable < moneyThresh)
        pid = ns.exec("s_grow.js", host.hostname, threads, t.hostname, threads, '--', n) << 2 | 1
    else
        pid = ns.exec("s_hack.js", host.hostname, threads, t.hostname, threads, '--', n) << 2 | 2

    _stats[pid % 4].push(pid >> 2);
    return pid >> 2;
}

/** @param {NSServer} s */
const getAvail = s => (s.maxRam / (s.hostname == 'home' ? 1.2 : 1) - ns.getServerUsedRam(s.hostname));

/** @type {(s: NSServer, ram: number, exec: (threads: number, n: number) => number) => void} */
function mine(s, ram, exec)
{
    var threads = Math.floor(getAvail(s) / ram);
    const buf = (s.maxRam / (16 * ram)) | 0
    if (threads <= 0) return;

    var n = threads / buf | 0;
    // ns.tprint(`starting ${n}buf + ${threads - n * buf} on ${s.hostname} [${threads}]`);

    const execerr = (x = 0) =>
        utilx.err(`exec ${x} ${threads} ${s.hostname} ${threads * ram}/${fn(getAvail(s), 0, 2)}`)

    if (!n)
        exec(threads, 0) || execerr(2)
    else while (n--)
    {
        exec(buf, 1 + Math.random() * 9998 | 0) || execerr(1)
        threads -= buf;
    }
}