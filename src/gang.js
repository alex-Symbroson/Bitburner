/// <reference path="../types.js"/>

import { fn, fn2, mean, selectRandom } from "./util";
import { task as dotask } from "./utilTask";

const names = [
	"Aaron,Bernd,Chloe,Dennis,Erika,Fred,Geralt,Hans,Irma,Joseph,Karla,Leni,Moses,Nero,Oslo,Paul,Quaxo,Ramses,Selena,Toby,Ulus,Veronika,Werner,Xenia,Yelena,Zorus"
		.split(","),
	"Anna,Bianca,Carlos,Dorid,Erwin,Fiona,Gina,Helen,Ingo,Justus,Kratos,Lennister,Mia,Nina,Olga,Pale,Quinh,Reya,Septimus,Teyra,Uwe,Voltolos,Wanda,Xerxes,Ylios,Zenita"
		.split(","),
]

const trainings = ["Train Combat", "Train Hacking", "Train Charisma"];
//const crimes = "Unassigned,Ransomware,Phishing,Identity Theft,DDoS Attacks,Plant Virus,Fraud & Counterfeiting,Money Laundering,Cyberterrorism".split(",")
const crimes = "Phishing,Identity Theft,Human Trafficking,Money Laundering,Cyberterrorism".split(",")
const niceThings = ["Vigilante Justice", "Ethical Hacking"]
const equipment = {
	Weapon: ["Baseball Bat", "Katana", "Glock 18C", "P90C", "Steyr AUG", "AK-47", "M15A10 Assault Rifle", "AWM Sniper Rifle"],
	Armor: ["Bulletproof Vest", "Full Body Armor", "Liquid Body Armor", "Graphene Plating Armor"],
	Vehicle: ["Ford Flex V20", "ATX1070 Superbike", "Mercedes-Benz S9001", "White Ferrari"],
	Rootkit: ["NUKE Rootkit", "Soulstealer Rootkit", "Demon Rootkit", "Hmap Node", "Jack the Ripper"],
	Augmentation: [
		"Bionic Arms", "Bionic Legs", "Bionic Spine", "BrachiBlades", "Nanofiber Weave", "Synthetic Heart", "Synfibril Muscle",
		"BitWire", "Neuralstimulator", "DataJack",
		"Graphene Bone Lacings"],
	AugmentationHack: ["BitWire", "Neuralstimulator", "DataJack"]
}

/** @type {{[name: string]: string}} */
const tasks = {};
var ethical = "";

/** @param {import("../Bitburner.t").NS} ns */
export async function main(ns)
{
	if (!ns.gang.inGang()) return;
	
	const memberNames = ns.gang.getMemberNames();
	for (const name of memberNames)
		tasks[name] = ns.gang.getMemberInformation(name).task;

	while (1)
	{
		const player = ns.getPlayer();
		const members = memberNames.map(name => ns.gang.getMemberInformation(name))
			.sort((a, b) => b.hack_exp - a.hack_exp)

		var wantedLevel = members.reduce((s, m) => s + m.wantedLevelGain, 0);
		const hackMean = mean(members.map(m => m.hack));

		for (const m of members)
		{
			const res = ns.gang.getAscensionResult(m.name);
			if (!res) continue;

			const req = calculateAscendTreshold(m.hack_asc_mult);
			if (res.hack > req)
			{
				dotask(ns, "gascend", m.name);
				// ns.tprint(`INFO ascended ${m.name} * ${fn(res.hack)} = ${fn(m.hack_asc_mult)}`);
				Object.assign(m, ns.gang.getMemberInformation(m.name));
			}

			// ns.tprint(m.name + (m.name == ethical ? "*" : "") + ": " + (m.hack >= hackMean) + " " + fn2(m.hack) + "/" + fn2(hackMean) + " " + m.task);
			if (m.hack > 1e3 && m.hack >= hackMean || m.hack >= 80e3)
			{
				if (m.name != ethical) setMTask(ns, m.name, crimes[2]);
			}
			else
				setMTask(ns, m.name, Math.random() < 0.2 ? "Train Combat" : "Train Hacking");

			for (const e of [...equipment.AugmentationHack, ...equipment.Rootkit])
			{
				if (m.upgrades.includes(e) || m.augmentations.includes(e)) continue;
				const cost = ns.gang.getEquipmentCost(e);
				if (cost * 50 < player.money)
				{
					// ns.tprint(`purchasing ${e} ${fn2(cost)} for ${m.name}`);
					dotask(ns, "gequip", m.name, e);
					player.money -= cost;
				}
			}
			await ns.sleep(100);
		}

		if (!ethical)
		{
			const newEthic = selectRandom(memberNames.filter(n => crimes.includes(tasks[n])));
			if (newEthic && setMTask(ns, newEthic, niceThings[0]))
				ethical = newEthic;
		}

		while (ns.gang.canRecruitMember())
		{
			const name = selectRandom(names)[memberNames.length];
			ns.tprint("INFO recruiting " + name);
			dotask(ns, "grecruit", name);
			await ns.sleep(100);
			memberNames.push(name);
			dotask(ns, "gtask", name, "Train Hacking");
		}
		await ns.sleep(1000);
	}
}

/** @type {(ns: NS, name: string, task?: string) => boolean} */
function setMTask(ns, name, task = null)
{
	if (name == ethical) ethical = null;
	if (tasks[name] == task) return;
	if (!task) task = tasks[name];
	else if (tasks[name] != task) tasks[name] = task;

	// ns.tprint(`task ${name}: ${task}.`);
	return ns.gang.setMemberTask(name, task);
}

// Credit: Mysteyes. https://discord.com/channels/415207508303544321/415207923506216971/940379724214075442
/** @type {(mult:number) => number} */
function calculateAscendTreshold(mult)
{
	if (mult < 1.632) return 1.6326;
	if (mult < 2.336) return 1.4315;
	if (mult < 2.999) return 1.284;
	if (mult < 3.363) return 1.2125;
	if (mult < 4.253) return 1.1698;
	if (mult < 4.860) return 1.1428;
	if (mult < 5.455) return 1.1225;
	if (mult < 5.977) return 1.0957;
	if (mult < 6.496) return 1.0869;
	if (mult < 7.008) return 1.0789;
	if (mult < 7.519) return 1.073;
	if (mult < 8.025) return 1.0673;
	if (mult < 8.513) return 1.0631;

	return 1.0591;
}