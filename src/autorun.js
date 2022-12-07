
import * as hack from "./hack";
import * as srvd from "./serverData";
import { BBServer, BBServerData } from "./servers";
import { closeWeights, fn, fn2, selectWeighted } from "./util";
import * as utilx from "./utilx";

/** @type {NS}    */ var ns;

/** @type {Partial<BBServerData>} */
let data = {};

const hackScript = { name: "mine.js", ram: 2.25 }
const hackSlave = { name: "s_grow.js", ram: 1.75 }
const stats = [[0], [0], [0]]
let weighted = false;

/** @param {NS} _ns */
export async function main(_ns)
{
    data = srvd.init(ns = _ns);
    utilx.init(ns = _ns);
    hack.init(ns = _ns);
    // flush port
    while (ns.readPort(1) != "NULL PORT DATA");

	if (ns.args.includes('-w')) weighted = true;
    const slaved = ns.args.includes("-s");
    hackScript.ram = ns.getScriptRam(hackScript.name)
    hackSlave.ram = ns.getScriptRam(hackSlave.name)

    if (!slaved)
    {
        const svList = srvd.getServers(s => s.root)
        for (const s of svList) mine(s, hackScript.ram,
            (t, n) => ns.exec(hackScript.name, s.name, t, t, '--', n));
    }

    for (var i = 0; ; i++)
    {
        const svList = srvd.getServers(s => s.root)
        if (slaved && i % 2 == 0)
        {
            for (const s of svList) updateVals(ns, s)
            for (const s of svList.filter(s => s.maxRam - ns.getServerUsedRam(s.name) > hackSlave.ram))
            {
                slave(s, svList);
                await ns.sleep(100);
            }
            while (handleMsg(String(ns.readPort(1))));
            stats.map((l, n) => stats[n] = stats[n].filter(p => ns.isRunning(p)))
            ns.print(`${stats[0].length} weakening, ${stats[1].length} growing, ${stats[2].length} hacking`)
        }
        await ns.sleep(1000);
    }
}

/** @type {(s: BBServer, svList: BBServer[]) => void} */
function slave(host, svList)
{
    const rootedServers = svList.filter(s => s.name != 'home')
    const moneyServers = rootedServers.filter(s => s.maxMoney)
    const weightedServers = !weighted ? moneyServers.map(e => ({e, w:1})) :
        closeWeights(moneyServers, s => s.maxRam, host.maxRam, 5)

    mine(host, hackSlave.ram, (t, n) => enslave(host, weightedServers, t, n))
}

/** @type {(host: BBServer, ws: {e:BBServer, w:number}[], t: number, n: number) => number} */
function enslave(host, ws, t, n)
{
    const moneyThreshFac = 0.9;
    const secThreashFac = 1.5;

    const target = selectWeighted(ws, s => s.w).e;
    const moneyThresh = target.maxMoney * moneyThreshFac;
    const secThresh = target.minSecLvl * secThreashFac;

    ns.print(`money ${target.moneyAvail.toExponential(2)} / ${moneyThresh.toExponential(2)} / ${target.maxMoney.toExponential(2)})`)
    ns.print(`sec   ${target.secLvl.toFixed(2)} / ${secThresh.toFixed(2)} / ${target.minSecLvl.toFixed(2)})`)
    var pid = 0;

    if (target.secLvl > secThresh)
    {
        //ns.print(`weaken ${host.name} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
        pid = ns.exec("s_weaken.js", host.name, t, target.name, t, '--', n) << 2 | 0
    }
    else if (target.moneyAvail < moneyThresh)
    {
        //ns.print(`grow ${host.name} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
        pid = ns.exec("s_grow.js", host.name, t, target.name, t, '--', n) << 2 | 1
    }
    else
    {
        //ns.print(`hack ${host.name} ${fn2(host.maxRam)} -> ${fn2(target.maxRam)} ${target.name}`)
        pid = ns.exec("s_hack.js", host.name, t, target.name, t, '--', n) << 2 | 2
    }
    stats[pid % 4].push(pid >> 2);
    return pid >> 2;
}

/** @type {(ns:NS, s:BBServer) => BBServer} */
function updateVals(ns, s)
{
    s.moneyAvail = ns.getServerMoneyAvailable(s.name);
    s.secLvl = ns.getServerSecurityLevel(s.name);
    return s;
}

/** @param {BBServer} s */
const getAvail = s => (s.maxRam / (s.name == 'home' ? 2 : 1) - ns.getServerUsedRam(s.name));

/** @type {(s: BBServer, ram: number, exec: (threads: number, n: number) => number) => void} */
function mine(s, ram, exec)
{
    var threads = Math.floor(getAvail(s) / ram);
    if (threads <= 0) return;

    var n = threads / 512 | 0;
    // ns.tprint(`starting ${n}x512 + ${threads - n * 512} on ${s.name} [${threads}]`);
    if (!n)
        exec(threads, 0) || utilx.err(`exec 2 ${threads} ${s.name} ${threads * ram}/${fn(getAvail(s), 0, 2)}`)
    else while (n--)
    {
        exec(512, 1 + Math.random() * 9998 | 0) || utilx.err(`exec 1 ${threads} ${s.name} ${threads * ram}/${fn(getAvail(s), 0, 2)}`)
        threads -= 512;
    }
}

/**
 * @param {string} s
 */
function handleMsg(s)
{
    if (s == "NULL PORT DATA") return false;

    const m = s.split(/\s+/);
    switch (m[0])
    {
        case "sd": 
                srvd.rmServer(m[1]);
                ns.writePort(2, "registered");
                break;
        case "sa": registerMiner(srvd.addServer(m[1])); break;
        default: throw Error(`unhadled msg cmd '${m[1]}`);
    }

    return true;
}

/**
 * @param {BBServer} s
 */
function registerMiner(s)
{
    hack.copy(s);
    mine(s, hackScript.ram, (t, n) => ns.exec(hackScript.name, s.name, t, t, '--', n));
}
