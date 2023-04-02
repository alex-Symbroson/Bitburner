// ./clear.js; ./autorun.js;

import { canGang, clearFlag, getFlag } from "./constants";

/** @type {NS}    */ var ns;

/** @param {NS} _ns */
export async function main(_ns)
{
    ns = _ns;
    for (const fn of 'disableLog,scan,scp,asleep,sleep,exec,getServerUsedRam,getHackingLevel,nuke,brutessh,ftpcrack,relaysmtp,sqlinject,httpworm'.split(',')) ns.disableLog(fn);

    ns.atExit(() => ns.closeTail());
    // ns.tail();

    let homeRam = ns.getServerMaxRam('home');
    let p = ns.getPlayer();

    ns.clearPort(1);
    clearFlag(ns, 'HGW');
    if (!ns.args.includes('-P')) clearFlag(ns, 'P');
    autoScript(ns, "t_connect home", () => true)();
    await ns.asleep(0.1);

    const canHgw = () => getFlag(ns, 'HGW') && ns.fileExists('Formulas.exe');

    const autoFormulas = autoScript(ns, 'tor -t', () => getFlag(ns, 'HGW') && !ns.fileExists('Formulas.exe'));
    const autoTor = autoScript(ns, 'tor', () => homeRam >= 64 && !ns.fileExists('SQLInject.exe'));
    const autoGang = autoScript(ns, 'gang', () => canGang(ns));
    const autoHome = autoScript(ns, 'home', () => homeRam > 64 || p.money > 5e6);
    const autoSlave = autoScript(ns, 'enslave', () => !ns.args.includes('-S') && !canHgw());
    const autoHGW = autoScript(ns, 'hgwg', () => !ns.args.includes('-S') && canHgw());
    // const autoWork = autoScript(ns, 'work', () => p.money > 5e6 && canGang(ns));

    const autoWalk = autoScript(ns, 'walk', () => true);
    const autoPurch = autoScript(ns, 'purchase -d -s', () => homeRam >= 64 && !ns.args.includes('-P'));
    const autoHud = autoScript(ns, 'hud', () => homeRam >= 64);
    const autoAug = autoScript(ns, 'augments -c', () => p.factions.length > 4);
    const autoDestroy = autoScript(ns, 't_destroyDaemon 12 autorun.js', () => ns.hasRootAccess('w0r1d_d43m0n'));

    autoWalk();

    for (var i = 0; ; i++)
    {
        if (i % 10 == 0)
        {
            homeRam = ns.getServerMaxRam('home');
            p = ns.getPlayer();

            autoSlave();
            autoFormulas();
            autoHGW();
            
            autoHome();
            autoTor();
            autoPurch();
            if (p.factions.length > 0) autoGang();
            autoHud();
        }

        if (i % 97 == 0) autoAug();
        if (i % 107 == 0) autoDestroy();

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
            if (!name.startsWith("t_") && name != "augments")
            {
                if (pid) ns.tprint(`WARN auto ${cmd}`);
                else ns.tprint(`ERROR auto ${cmd} failed`);
            }
        }
        return pid;
    }
}