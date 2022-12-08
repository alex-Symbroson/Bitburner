
import { copy } from "./clear";
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

            if (i % 4 == 0)
            {
                stats.map((l, n) => stats[n] = stats[n].filter(p => ns.isRunning(p)))
                if (String(stats) != lastStats)
                    ns.tprint(`${stats[0].length} weakening, ${stats[1].length} growing, ${stats[2].length} hacking`)
                lastStats = String(stats);
            }
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

function hackNewServers()
{
    for (const s of srvd.getServers(s => srvd.rootable(s)))
    {
        hack.crack(ns, s.name);
        if (s.root) continue;

        ns.nuke(s.name);
        s.root = true;
        copy(ns, s.name);
        ns.tprint(`  EXEC home;connect ${data.servers[s.name].path.join(";connect ")};backdoor`);
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

/** @param {BBServer} s */
const registerMiner = s => copy(ns, s.name);
