// ./clear.js; ./autorun.js;

import { canGang, clearFlag, getFlag } from "./constants";

/** @type {NS}    */ var ns;
/** @type {{[cmd:string]:number}} */
const pids = {}

/** @param {NS} _ns */
export async function main(_ns)
{
    ns = _ns;
    for (const fn of 'disableLog,scan,scp,asleep,sleep,exec,getServerUsedRam,getHackingLevel,nuke,brutessh,ftpcrack,relaysmtp,sqlinject,httpworm'.split(',')) ns.disableLog(fn);

    ns.atExit(() => ns.closeTail());
    // ns.tail();

    let homeRam = ns.getServerMaxRam('home');
    let p = ns.getPlayer();
    let now = Date.now();

    ns.clearPort(1);
    if (!ns.args.includes('-P')) clearFlag(ns, 'P');
    clearFlag(ns, 'NMI');
    autoScript(ns, "t_connect home", () => true)();
    await ns.asleep(0.1);

    const canHgw = () => getFlag(ns, 'HGW') && ns.fileExists('Formulas.exe');
    const canPurch = () => homeRam >= 64 && !getFlag(ns, 'P');

    const autoFormulas = autoScript(ns, 'tor -f', () => getFlag(ns, 'HGW') && !ns.fileExists('Formulas.exe'));
    const autoTor = autoScript(ns, 'tor', () => homeRam >= 64 && !ns.fileExists('SQLInject.exe'));
    const autoGang = autoScript(ns, 'gang -d', () => p.factions.length > 0 && canGang(ns));
    const autoHome = autoScript(ns, 'home', () => homeRam > 64 || p.money > 5e6);
    const autoSlave = autoScript(ns, 'enslave -d', () => !ns.args.includes('-S'));
    const autoHGW = autoScript(ns, 'hgwg -d', () => !ns.args.includes('-S') && canHgw());
    // const autoWork = autoScript(ns, 'work', () => p.money > 5e6 && canGang(ns));

    const autoCont = autoScript(ns, 'contracts -s', () => homeRam > 64);
    const autoPurch = autoScript(ns, 'purchase -D -s', () => !ns.args.includes('-P') && canPurch());
    const autoHud = autoScript(ns, 'hud -d', () => homeRam >= 64);
    const autoAug = autoScript(ns, 'augments -c', () => p.factions.length >= 2);
    const autoDestroy = autoScript(ns, 't_destroyDaemon 12 autorun.js', () => ns.hasRootAccess('w0r1d_d43m0n'));

    ns.exec('walk.js', 'home');
    let tNextShare = now;

    now = Date.now();
    for (var i = 0; ; i++)
    {
        homeRam = ns.getServerMaxRam('home');
        p = ns.getPlayer();

        if (i % 10 == 0) autoSlave();
        if (i % 10 == 8) autoFormulas(); // execute after purchase
        if (i % 10 == 1) autoHGW();

        if (i % 10 == 2) autoHome();
        if (i % 10 == 3) autoTor();
        if (i % 10 == 4 && !pids['tor -t']) autoPurch();
        if (i % 10 == 5) autoGang();
        if (i % 10 == 6) autoHud();

        now = Date.now();
        if (i % 100 == 7) autoAug();
        if (i % 600 == 7) autoCont();
        if (i % 600 == 9) autoDestroy();
        if (i % 100 == 9) for (const f of ns.ls('home', '-copy')) ns.rm(f);

        if (now > tNextShare) autoShare();
        if (now > tNextShare) tNextShare = now + 10e3
        await ns.asleep(1000);
    }
}

/** @type {(ns: NS, cmd: string, cond: (...a: any[]) => boolean) => ((...a: any[]) => number)} */
function autoScript(ns, cmd, cond)
{
    const arg = cmd.split(' ');
    const name = arg.shift();

    var pid = ns.ps().find(s => s.filename == name + '.js')?.pid || 0;
    return (...a) =>
    {
        if (!ns.isRunning(pid, 'home')) pid = 0;
        if (!pid && cond(...a))
        {
            pid = ns.exec(name + '.js', 'home', 1, ...arg);
            if(!pid) ns.tprint(`ERROR auto ${cmd} failed`);
            else if (!name.startsWith("t_") && name.includes('-d'))
                ns.tprint(`WARN auto ${cmd}`);
        }
        return pids[cmd] = pid;
    }
}

function autoShare()
{
    const max = ns.getServerMaxRam('home');
    const used = ns.getServerUsedRam('home');
    const ram = (max - used - 100) * 0.9;
    const threads = ram / ns.getScriptRam('s_share.js') | 0;
    if (threads > 0) ns.exec('s_share.js', 'home', threads);
}