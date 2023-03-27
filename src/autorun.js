// ./clear.js -c -k -x; ./autorun.js; ./purchase.js -d; ./gang.js; ./tor.js
// ./clear.js -c -k -x; ./autorun.js; ./gang.js; ./tor.js

import * as srvd from "./serverData";
import * as enslave from "./enslave";
import * as hack from "./hack";
import { copy } from "./clear";
import { BBServerData } from "./servers";
import { SProcStats } from "./classes";

/** @type {NS}    */ var ns;

/** @type {Partial<BBServerData>} */
let data = {};
let errsPerSec = 0;

/** @type {SStats} */
const stats = { idle: 0, all: new SProcStats(), active: {} }

/** @param {NS} _ns */
export async function main(_ns)
{
    ns = _ns;
    for (const fn of 'disableLog,scan,scp,asleep,sleep,exec,getServerUsedRam,getHackingLevel,nuke,brutessh,ftpcrack,relaysmtp,sqlinject,httpworm'.split(',')) ns.disableLog(fn);

    ns.atExit(() => ns.closeTail());
    // ns.tail();

    let homeRam = ns.getServerMaxRam('home');
    let p = ns.getPlayer();
    data = srvd.init(ns = _ns);
    enslave.init(ns = _ns, stats);
    hack.init(ns = _ns);

    // flush port
    while (ns.readPort(1) != "NULL PORT DATA");
    autoScript(ns, "t_connect home", () => true)();
    await ns.asleep(0.1);

    const autoTor = autoScript(ns, 'tor', () => homeRam >= 64 && !ns.fileExists('SQLInject.exe'));
    const autoGang = autoScript(ns, 'gang', () => ns.heart.break() < -54e3);
    const autoClear = autoScript(ns, 'clear', () => true);
    const autoHome = autoScript(ns, 'home', () => p.money > 5e6);
    // const autoWork = autoScript(ns, 'work', () => p.money > 5e6 && ns.heart.break() < -54e3);

    const autoWalk = autoScript(ns, 'walk', () => true);
    const autoPurch = autoScript(ns, 'purchase -d', () => homeRam >= 64 && !ns.args.includes('-P'));
    const autoHud = autoScript(ns, 'hud', () => homeRam >= 64);
    const autoAug = autoScript(ns, 'augments -c', () => homeRam >= 1 << 10 || p.factions.includes("CyberSec"));
    const autoDestroy = autoScript(ns, 't_destroyDaemon 12 autorun.js', () => ns.hasRootAccess('w0r1d_d43m0n'));

    autoWalk();
    autoPurch();

    for (var i = 0; ; i++)
    {
        if (i % 2 == 0) while (handleMsg(String(ns.readPort(1))));
        if (i % 20 == 0) await checkNewServers();
        if (i % 2 == 0) await enslaveServers();

        if (errsPerSec > 0 && --errsPerSec > 10)
            errsPerSec = i % 10 / 2 | 0, autoClear();

        if (i % 10 == 0)
        {
            homeRam = ns.getServerMaxRam('home')
            p = ns.getPlayer();
            printStats();
            errsPerSec -= 10;

            autoHome();
            autoTor();
            if (p.factions.length > 0) autoGang();
            autoHud();
        }

        if (i % 97 == 0) autoAug();
        if (i % 506 == 0) autoDestroy();

        await ns.asleep(1000);
    }
}

/** @type {(ns: NS, name: string, cond: (...a: any[]) => boolean) => ((...a: any[]) => void)} */
function autoScript(ns, name, cond)
{
    var arg = name.split(' ');
    name = arg[0];

    var pid = ns.ps().find(s => s.filename == name + '.js')?.pid || 0;
    return (...a) =>
    {
        if (!ns.isRunning(pid, 'home')) pid = 0;
        if (!pid && cond(...a))
        {
            pid = ns.exec(name + '.js', 'home', 1, ...arg.slice(1));
            if (!name.startsWith("t_") && name != "augments")
            {
                if (pid) ns.tprint(`WARN auto ${name}`);
                else ns.tprint(`ERROR auto ${name} failed`);
            }
        }
    }
}

const tasks = [];
/** @type {(ns: NS, name: string, cond: (...a: any[]) => boolean) => ((...a: any[]) => void)} */
function autoTask(ns, name, cond)
{
    return (...a) => cond(...a) && tasks.push(() => ns.exec(name + '.js', 'home', 1));
}

/** @param {string} s */
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
        case "sa": registerMiner(m[1]); break;
        default: throw Error(`unhadled msg cmd '${m[1]}`);
    }

    return true;
}

/** @param {string} s */
function registerMiner(s)
{
    copy(ns, s);
    srvd.addServer(s);
}

async function enslaveServers()
{
    stats.idle = 0
    const svList = srvd.getServers(s => s.hasAdminRights)

    for (const s of svList)
    {
        try { srvd.addServer(s.hostname); }
        catch (e) { continue; }
        if (s.maxRam - s.ramUsed < enslave.hackSlave.ram) continue
        errsPerSec += enslave.slave(s, svList);
        await ns.sleep(10);
    }
}

async function checkNewServers()
{
    for (const s of srvd.scanServers())
    {
        if (s.moneyMax && !stats.active[s.hostname])
            stats.active[s.hostname] = { grow: [], weaken: [], hack: [] }

        hack.checkServer(ns, s);
        await ns.sleep(10);
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