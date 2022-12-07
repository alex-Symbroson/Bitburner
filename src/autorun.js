
import * as enslave from "./enslave";
import * as hack from "./hack";
import { buy_upgrade } from "./nodehack";
import * as srvd from "./serverData";
import { BBServer, BBServerData } from "./servers";
import * as utilx from "./utilx";

/** @type {NS}    */ var ns;

/** @type {Partial<BBServerData>} */
let data = {};

const stats = [[0], [0], [0]]

/** @param {NS} _ns */
export async function main(_ns)
{
    data = srvd.init(ns = _ns);
    utilx.init(ns = _ns);
    hack.init(ns = _ns);
    enslave.init(ns = _ns, stats);
    // flush port
    while (ns.readPort(1) != "NULL PORT DATA");

    var lastStats = "";

    for (var i = 0; ; i++)
    {
        const svList = srvd.getServers(s => s.root)
        if (i % 2 == 0)
        {
            for (const s of svList) updateVals(ns, s)
            for (const s of svList.filter(s => s.maxRam - ns.getServerUsedRam(s.name) > enslave.hackSlave.ram))
            {
                enslave.slave(s, svList);
                await ns.sleep(100);
            }
            while (handleMsg(String(ns.readPort(1))));

            stats.map((l, n) => stats[n] = stats[n].filter(p => ns.isRunning(p)))
            if (String(stats) != lastStats)
                ns.tprint(`${stats[0].length} weakening, ${stats[1].length} growing, ${stats[2].length} hacking`)
            lastStats = String(stats);
        }

        if (i % 20 == 0) hackNewServers();

        buy_upgrade(ns)
        await ns.sleep(1000);
    }
}


/** @type {(ns:NS, s:BBServer) => BBServer} */
function updateVals(ns, s)
{
    s.moneyAvail = ns.getServerMoneyAvailable(s.name);
    s.secLvl = ns.getServerSecurityLevel(s.name);
    return s;
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

function hackNewServers()
{
    srvd.scanServerPaths()
    for (const s of srvd.getServers(s => !s.root && srvd.rootable(s)))
    {
        hack.hack(s);
        hack.copy(s);
        ns.tprint(`  EXEC home;connect ${data.servers[s.name].path.join(";connect ")};backdoor`)
    }
}

/**
 * @param {BBServer} s
 */
function registerMiner(s)
{
    hack.copy(s);
}
