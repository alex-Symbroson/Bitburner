
import * as srvd from "./serverData";
import * as enslave from "./enslave";
import * as hack from "./hack";
import { copy } from "./clear";
import { buy_upgrade } from "./nodehack";
import { BBServerData } from "./servers";

/** @type {NS}    */ var ns;

/** @type {Partial<BBServerData>} */
let data = {};

const stats = [[0], [0], [0]]

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
        if (i % 2 == 0) await enslaveServers();
        if (i % 20 == 0) await checkNewServers();
        if (i % 4 == 0) printStats();

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
        case "sa": registerMiner(srvd.addServer(m[1])); break;
        default: throw Error(`unhadled msg cmd '${m[1]}`);
    }

    return true;
}

/** @param {NSServer} s */
function registerMiner(s)
{
    copy(ns, s.hostname);
    srvd.addServer(s.hostname);
}

async function enslaveServers()
{
    const svList = srvd.getServers(s => s.hasAdminRights)
    for (const s of svList)
    {
        srvd.addServer(s.hostname)
        if (s.maxRam - s.ramUsed < enslave.hackSlave.ram) continue
        enslave.slave(s, svList);
        await ns.sleep(10);
    }
}

async function checkNewServers()
{
    for (const s of srvd.scanServers())
    {
        hack.checkServer(ns, s);
        await ns.sleep(10);
    }
}

var lastStats = "";
function printStats()
{
    stats.map((l, n) => stats[n] = stats[n].filter(p => ns.isRunning(p)))
    if (String(stats) != lastStats)
        ns.tprint(`${stats[0].length} weakening, ${stats[1].length} growing, ${stats[2].length} hacking`)
    lastStats = String(stats);
}
