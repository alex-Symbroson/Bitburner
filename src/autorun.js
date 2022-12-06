
import * as servers from "./servers";
import * as utilx from "./utilx";

const sd = servers.data;
const { msg } = utilx;
/** @type {NS}    */ var ns;

const hackScript = "mine.js";
var hackRam = 2.25;

/** @param {NS} _ns */
export async function main(_ns)
{
    servers.init(ns = _ns);
    utilx.init(ns = _ns);

    const svList = Object.values(sd.servers)
        .filter(s => s.root)
    hackRam = ns.getScriptRam(hackScript)

    for (var i = 0; ; i++)
    {
        if (i % 60 == 0) hackServers(svList);
        if (i % 3 == 0) purchase(svList);
        while (handleMsg(ns.readPort(1)));
        await ns.sleep(1000);
    }
}

/**
 * @param {servers.BBServer[]} svList
 */
function hackServers(svList)
{
    for (const s of svList)
    {
        const avail = (s.maxRam - ns.getServerUsedRam(s.name)) / (s.name == 'home' ? 2 : 1);
        var threads = Math.floor(avail / (hackRam)) - 1;
        if (threads <= 0) continue;

        var n = threads / 512 | 0;
        ns.tprint(`starting ${n}x512 + ${threads - n * 512} on ${s.name} [${threads}] [${avail}/${hackRam}]`);
        while (n--)
        {
            ns.exec(hackScript, s.name, 512, 512, '--', n + 1) || utilx.err("exec 1");
            threads -= 512;
        }
        ns.exec(hackScript, s.name, threads, threads, '--', 0) || utilx.err("exec 2 " + threads);
    }
}

/** @type {(s:servers.BBServer) => Promise<void>} */
export async function mine(s)
{
    const avail = (s.maxRam - ns.getServerUsedRam(s.name)) / (s.name == 'home' ? 2 : 1);
    var threads = Math.floor(avail / (hackRam));
    if (threads <= 0) return;

    var n = threads / 512 | 0;
    ns.tprint(`starting ${n}x512 + ${threads - n * 512} on ${s.name} [${threads}] [${avail}/${hackRam}]`);
    while (n--)
    {
        ns.exec(hackScript, s.name, 512, 512, '--', n + 1) || utilx.err("exec 1");
        threads -= 512;
    }
    ns.exec(hackScript, s.name, threads, threads, '--', 0) || utilx.err("exec 2 " + threads);
}

/**
 * @param {string | number} s
 */
function handleMsg(s)
{
    if (s == "NULL PORT DATA") return false

    ns.tprint(`message: ${s}`)

    return true;
}