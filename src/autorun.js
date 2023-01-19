// ./clear.js -c -k -x; ./autorun.js; ./purchase.js -d; ./gang.js; ./tor.js
// ./clear.js -c -k -x; ./autorun.js; ./gang.js; ./tor.js

import * as srvd from "./serverData";
import * as enslave from "./enslave";
import * as hack from "./hack";
import { copy } from "./clear";
import { buy_upgrade } from "./nodehack";
import { BBServerData } from "./servers";
import { SProcStats } from "./classes";

/** @type {NS}    */ var ns;

/** @type {Partial<BBServerData>} */
let data = {};


/** @type {SStats} */
const stats = { idle: 0, all: new SProcStats(), active: {} }

/** @param {NS} _ns */
export async function main(_ns)
{
    data = srvd.init(ns = _ns);
    enslave.init(ns = _ns, stats);
    hack.init(ns = _ns);

    // flush port
    while (ns.readPort(1) != "NULL PORT DATA");

    for (var i = 0; ; i++)
    {
        if (i % 2 == 0) while (handleMsg(String(ns.readPort(1))));
        if (i % 20 == 0) await checkNewServers();
        if (i % 2 == 0) await enslaveServers();
        if (i % 10 == 0) printStats();

        buy_upgrade(ns);
        await ns.sleep(1000);
    }
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
        catch(e) { continue; }
        if (s.maxRam - s.ramUsed < enslave.hackSlave.ram) continue
        enslave.slave(s, svList);
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
        ns.tprint(
            `${stats.all.weaken.length} [${max.weaken}] weakening, ` +
            `${stats.all.grow.length} [${max.grow}] growing, ` +
            `${stats.all.hack.length} [${max.hack}] hacking, ` +
            `${stats.idle} idle`)
    lastStats = JSON.stringify(stats.all);
}
