/// <reference path="../types.js"/>

import { fn, fn2, mean, selectRandom } from "./util";

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

/*
o={'0':0,k:"e3",m:"e6",b:"e9",t:"e12"}
l=[...document.querySelectorAll(".css-1frkqed")]
.map(e => Number(e.innerText.slice(1,-1) + o[e.innerText.slice(-1)]))
l.reverse().slice(70,-1).map((e,i)=>e*1.9**i).map(e=>e.toExponential())

var cur=null, list={}

if(typeof itv!="undefined")clearInterval(itv)
var itv=setInterval(()=>{
	var t=document.querySelector('#terminal')
	if(!t)return;
	list={};var li=0, lines = t.innerText.split("\n").slice(-100).reverse();
	var cmds = lines.filter((s,i) => (li==0 || i-li < 10) && s.startsWith("autorun.js:   home;") && (li=i))
	cmds.map(l=>list[l]=1)
},5000)

if(typeof itvCopy!="undefined")clearInterval(itvCopy)
var itvCopy=setInterval(()=>{
	var t=document.querySelector('#terminal')
	var ti=document.querySelector('#terminal-input')
	if(!t||!ti)return;

	for(var c in list){
		var s = c.match(/ (\S+?);backdoor$/)[1]
		if(t.innerText.includes(s+"' successful!")) delete list[c]
	}

	var cmds = Object.keys(list).reverse()
	if (!cmds.length) return
	copyTextToClipboard(cmds[0].slice(14))
	ti.focus()
},500);

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus(); textArea.select();

  try { document.execCommand('copy'); } 
  catch (err) { console.error('copy2clipboard failed', err); }
  document.body.removeChild(textArea);
}
*/


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
				ns.gang.ascendMember(m.name);
				// ns.tprint(`INFO ascended ${m.name} * ${fn(res.hack)} = ${fn(m.hack_asc_mult)}`);
				Object.assign(m, ns.gang.getMemberInformation(m.name));
			}

			// ns.tprint(m.name + (m.name == ethical ? "*" : "") + ": " + (m.hack >= hackMean) + " " + fn2(m.hack) + "/" + fn2(hackMean) + " " + m.task);
			if (m.hack > 1e3 && m.hack >= hackMean || m.hack >= 80e3)
			{
				if (m.name != ethical) setMemberTask(ns, m.name, crimes[2]);
			}
			else
				setMemberTask(ns, m.name, Math.random() < 0.2 ? "Train Combat" : "Train Hacking");

			for (const e of [...equipment.AugmentationHack, ...equipment.Rootkit])
			{
				if (m.upgrades.includes(e) || m.augmentations.includes(e)) continue;
				const cost = ns.gang.getEquipmentCost(e);
				if (cost * 50 < player.money)
				{
					// ns.tprint(`purchasing ${e} ${fn2(cost)} for ${m.name}`);
					ns.gang.purchaseEquipment(m.name, e) || ns.tprint("ERROR buying equipment");
					player.money -= cost;
				}
			}

			let task = ""
			/*
			else if (res.hack < 1) task = "Train Hacking"
			else if (wantedLevel < 0)
			{
				/** @type {{crime:String, gain:number}} * /
				var oktask = null;
				for (const crime of crimes)
				{
					ns.gang.setMemberTask(m.name, crime)
					const nm = ns.gang.getMemberInformation(m.name);
					const ok = Math.abs(nm.wantedLevelGain) > 0.001;
					if (ok && wantedLevel + nm.wantedLevelGain < 0) oktask = { crime, gain: nm.wantedLevelGain }
				}
				if (oktask) task = oktask.crime
			}

			if (!task) task = "Ethical Hacking"
			
			if (task != m.task)
			{
				ns.gang.setMemberTask(m.name, task)
				const nm = ns.gang.getMemberInformation(m.name);
				wantedLevel += nm.wantedLevelGain;
				ns.tprint(`set ${m.name} task from ${m.task} to ${task} + ${fn(nm.wantedLevelGain)} to ${fn(wantedLevel)}`)
				if (!ns.args.includes("-s")) ns.gang.setMemberTask(m.name, m.task)
			} else wantedLevel += m.wantedLevelGain;
			*/
		}

		if (!ethical)
		{
			const newEthic = selectRandom(memberNames.filter(n => crimes.includes(tasks[n])));
			if (newEthic && setMemberTask(ns, newEthic, niceThings[0]))
				ethical = newEthic;
		}

		while (ns.gang.canRecruitMember())
		{
			const name = selectRandom(names)[memberNames.length];
			ns.tprint("INFO recruiting " + name)
			ns.gang.recruitMember(name) || ns.tprint("ERROR recruiting " + name);
			memberNames.push(name);
			ns.gang.setMemberTask(name, "Train Hacking");
		}
		await ns.sleep(2000);
	}
}

/** @type {(ns: NS, name: string, task?: string) => boolean} */
function setMemberTask(ns, name, task = null)
{
	if (name == ethical) ethical = null;
	if (tasks[name] == task) return;
	if (!task) task = tasks[name];
	else if (tasks[name] != task) tasks[name] = task;

	// ns.tprint(`task ${name}: ${task}.`);
	return ns.gang.setMemberTask(name, task) || ns.tprint("ERROR task failed") || false;
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