
import { BBServer } from "./servers";
import { closeWeights, fn, selectWeighted } from "./util";
import * as utilx from "./utilx";

/** @type {NS}    */ var ns;

export const hackSlave = { name: "s_grow.js", ram: 1.75 }

let weighted = false;
let _stats = [[0]];   // ovrd from autorun

/** @type {(ns:NS, stats:number[][]) => void} _ns */
export function init(_ns, stats)
{
    utilx.init(ns = _ns);
    _stats = stats;
    if (ns.args.includes('-w')) weighted = true;
    hackSlave.ram = ns.getScriptRam(hackSlave.name)
}

/** @type {(s: BBServer, svList: BBServer[]) => void} */
export function slave(host, svList)
{
    const rootedServers = svList.filter(s => s.name != 'home')
    const moneyServers = rootedServers.filter(s => s.maxMoney)
    if (!moneyServers.length) return;

    const weightedServers = !weighted ? moneyServers.map(e => ({ e, w: 1 })) :
        closeWeights(moneyServers, s => s.maxRam, host.maxRam, 5)
    mine(host, hackSlave.ram, (t, n) => enslave(host, weightedServers, t, n))
}

/** @type {(host: BBServer, ws: {e:BBServer, w:number}[], t: number, n: number) => number} */
function enslave(host, ws, threads, n)
{
    const moneyThreshFac = 0.9;
    const secThreashFac = 1.5;

    const t = selectWeighted(ws, s => s.w).e;
    const moneyThresh = t.maxMoney * moneyThreshFac;
    const secThresh = t.minSecLvl * secThreashFac;

    ns.print(`money ${t.moneyAvail.toExponential(2)} / ${moneyThresh.toExponential(2)} / ${t.maxMoney.toExponential(2)})`)
    ns.print(`sec   ${t.secLvl.toFixed(2)} / ${secThresh.toFixed(2)} / ${t.minSecLvl.toFixed(2)})`)
    var pid = 0;

    if (t.secLvl > secThresh)
        pid = ns.exec("s_weaken.js", host.name, threads, t.name, threads, '--', n) << 2 | 0
    else if (t.moneyAvail < moneyThresh)
        pid = ns.exec("s_grow.js", host.name, threads, t.name, threads, '--', n) << 2 | 1
    else
        pid = ns.exec("s_hack.js", host.name, threads, t.name, threads, '--', n) << 2 | 2
    
    _stats[pid % 4].push(pid >> 2);
    return pid >> 2;
}

/** @param {BBServer} s */
const getAvail = s => (s.maxRam / (s.name == 'home' ? 1.2 : 1) - ns.getServerUsedRam(s.name));

/** @type {(s: BBServer, ram: number, exec: (threads: number, n: number) => number) => void} */
function mine(s, ram, exec)
{
    var threads = Math.floor(getAvail(s) / ram);
    const buf = s.name == "home" ? threads / 25 | 0 : 2 << 13
    if (threads <= 0) return;

    var n = threads / buf | 0;
    // ns.tprint(`starting ${n}buf + ${threads - n * buf} on ${s.name} [${threads}]`);

    const execerr = (x = 0) =>
        utilx.err(`exec ${x} ${threads} ${s.name} ${threads * ram}/${fn(getAvail(s), 0, 2)}`)

    if (!n)
        exec(threads, 0) || execerr(2)
    else while (n--)
    {
        exec(buf, 1 + Math.random() * 9998 | 0) || execerr(1)
        threads -= buf;
    }
}