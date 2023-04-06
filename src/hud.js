//  Original script by: u/I_hate_you_wasTaken, (https://www.reddit.com/r/Bitburner/comments/10urhbn/custom_overview_stats_but_better/)   

/** @param {NS} ns **/
export async function main(ns)
{
    // ns.disableLog("ALL");
    // ns.clearLog();
    // ns.tail();

    const daemon = ns.args.includes('-d');
    const args = ns.flags([["d", false], ["help", false]]);
    if (args.help)
    {
        ns.tprint("This script will enhance your HUD (Heads up Display) with custom statistics.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        return;
    }

    /** @type {Document} */
    const doc = eval('document');
    /** @type {(sel: string) => void} */
    const removeByClassName = (sel) => doc.querySelectorAll(sel).forEach(el => el.remove());
    /** @type {(sel: string, col: string) => void} */ // @ts-ignore 2339
    const colorByClassName = (sel, col) => doc.querySelectorAll(sel).forEach(el => el.style.color = col);
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');

    /** @type {(title:string, value:string|number, color?:""|keyof import("../Themes").ITheme, tip?:string) => void} */
    function addElement(title, value, color = "", tip = "")
    {
        const cssClass = `HUD_${title.replace(/[^a-z_-]+/gi, '')}`;
        hook0.insertAdjacentHTML('beforeend', `<element class="${cssClass} HUD_el" title="${tip || title}">${title} &nbsp;</element><br class="HUD_el">`);
        colorByClassName(`.${cssClass}`, theme[color || "int"]);
        hook1.insertAdjacentHTML('beforeend', `<element class="${cssClass}_H HUD_el">${value + '<br class="HUD_el">'}</element>`);
        colorByClassName(`.${cssClass}_H`, theme[color || "int"]);
    }

    var theme = ns.ui.getTheme()
    /** @type {{[key:string]:string[]}} */ // @ts-ignore
    const extraInfo = { purch: "", augs: "" };

    while (true)
    {
        try
        {
            let player = ns.getPlayer();

            /** @type {import("../Bitburner.t").GangGenInfo} */
            var gangInfo = null;
            var gangFaction = "";
            var gangIncome = "";
            var gangRespect = "";

            let gangAPI = false;
            try
            {
                gangInfo = ns.gang.getGangInformation();
                gangAPI = gangInfo != null;
                gangFaction = gangInfo.faction;
                gangIncome = ns.formatNumber(gangInfo.moneyGainRate * 5, 1);  // A tick is every 200ms. To get the actual money/s, multiple moneyGainRate by 5.
                gangRespect = ns.formatNumber(gangInfo.respect, 1) + ' &nbsp;';
            }
            catch {
                ns.print("gangAPI: " + gangAPI);
            }

            var playerCity = player.city; // city
            var playerLocation = player.location
                .replace(/Enterprises?/, 'Ent')
                .replace('Corporation', 'Corp')
                .replace('University', 'Uni'); // location
            var playerKills = player.numPeopleKilled; // numPeopleKilled
            var playerKarma = ns.heart.break() | 0;

            let purchased_servers = ns.getPurchasedServers(); // get every bought server if exists, else just create our blank array and add home to it.
            purchased_servers.push("home"); // add home to the array.
            let cumulative = 0;
            for (let pserv of purchased_servers)
            {
                let gains = 0;
                for (var script of ns.ps(pserv))
                {
                    var s = ns.getRunningScript(script.pid)
                    if (s.onlineRunningTime > 0) gains += s.onlineMoneyMade / s.onlineRunningTime
                }
                cumulative += gains;
            }

            var scriptIncome = ns.formatNumber(cumulative, 2); // $/s
            var scriptXP = ns.formatNumber(ns.getTotalScriptExpGain(), 2); // xp/s

            // Extra info from Port 20

            var buf = '';
            while ((buf = String(ns.readPort(20))) != 'NULL PORT DATA')
            {
                const [key, ...data] = buf.split('§');
                extraInfo[key] = data;
            }

            const alpha = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            const purchTitle = extraInfo.purch[0]?.replace(/INFO (\S+) \[(\S+)\]/g, '<sup>$1</sup><sub>$2</sub>').replace(/(\d+)(?=[/<])/g, (m, n) => alpha[Number(n)]);
            const purchValue = extraInfo.purch[1]?.replace(/(\d+) (\d+),? ?/g, (m, n, s) => alpha[Number(s)] + (n > 1 ? `<sup>${n}</sup>` : ''));
            const augsTitle = extraInfo.augs[0]?.replace(/^(\d+):(\d+)/g, '<sup>$1</sup><sub>$2</sub>')

            // End paramaters, begin CSS: 
            const supb = '<sup></sup><sub></sub>';

            removeByClassName('.HUD_el');
            var theme = ns.ui.getTheme();
            removeByClassName('.HUD_sep');

            hook0.insertAdjacentHTML('beforebegin', `<hr class="HUD_sep HUD_el">`);
            hook1.insertAdjacentHTML('beforebegin', `<hr class="HUD_sep HUD_el">`);

            addElement("City", playerCity, "cha", "The name of the City you are currently in.")
            addElement("Loc", playerLocation, "cha", "Your current location inside the city.")

            if (gangInfo != null)
            {
                addElement("Fac", gangFaction, "int", "The name of your gang faction.")
                addElement("Resp", gangRespect, "int", "The respect of your gang.")
                addElement("Inc", "$" + gangIncome + '/s', "int", "The income of your gang.")
            }

            addElement("ScrInc", "$" + scriptIncome + '/s', 'money', "Money Gain from Scripts per Second.")
            addElement("ScrExp", scriptXP + '/s', 'money', "XP Gain from Scripts per Second.")
            addElement("Karma", playerKarma, "hp", "Your karma.")
            addElement("Kills", playerKills, "hp", "Your kill count, increases every successful homicide.")

            if (extraInfo.purch) addElement(`Srv${purchTitle}` + supb, purchValue + supb, "secondary", "Purchased Servers")
            if (extraInfo.augs) addElement('Augs' + augsTitle + supb, extraInfo.augs[1] + supb, "secondary", "Next Augmentations")

            var theme = ns.ui.getTheme()
        }
        catch (err)
        {
            ns.tprint("ERROR: Update Skipped: " + String(err.stack));
            if (!daemon) return;
            await ns.asleep(10e3);
        }

        ns.atExit(function () { removeByClassName('.HUD_el'); });
        if (!daemon) return;
        await ns.asleep(200);
    }
}