/// <reference path="../types.js"/>

import { fn, selectRandom } from "./util";

const names = (
	"Aaron,Bernd,Chloe,Dennis,Erika,Fred,Geralt,Hans,Irma,Joseph,Karla,Leni,Moses,Nero,Oslo,Paus,Quaxo,Ramses,Selena,Toby,Ulus,Veronika,Werner,Xenia,Yelena,Zorus" +
	"Anna,Bianca,Carlos,Dorid,Erwin,Fiona,Gina,Helen,Ingo,Justus,Kratos,Lennister,Mia,Nina,Olga,Pale,Quinh,Reya,Septimus,Teyra,Uwe,Voltolos,Wanda,Xerxes,Ylios,Zenita"
).split(",")

const trainings = ["Train Combat", "Train Hacking", "Train Charisma"];
//const crimes = "Unassigned,Ransomware,Phishing,Identity Theft,DDoS Attacks,Plant Virus,Fraud & Counterfeiting,Money Laundering,Cyberterrorism".split(",")
const crimes = "Phishing,Identity Theft,Money Laundering,Cyberterrorism".split(",")
const niceThings = ["Ethical Hacking"]

/*
o={'0':0,k:"e3",m:"e6",b:"e9",t:"e12"}
l=[...document.querySelectorAll(".css-1frkqed")]
.map(e => Number(e.innerText.slice(1,-1) + o[e.innerText.slice(-1)]))
l.reverse().slice(70,-1).map((e,i)=>e*1.9**i).map(e=>e.toExponential())
*/

/** @param {import("../Bitburner.t").NS} ns */
export async function main(ns)
{
	while (1)
	{
		const members = ns.gang.getMemberNames().map(name => ns.gang
			.getMemberInformation(name))
			.sort((a, b) => b.hack_exp - a.hack_exp)
		var wantedLevel = 0;
		ns.tprint(members.map(n => n.name))

		for (const m of members)
		{
			let task = ""
			const res = ns.gang.getAscensionResult(m.name);
			if (!res) return ns.tprint("ERROR for " + m.name)
			const req = calculateAscendTreshold(m.hack_asc_mult);

			if (res.hack > req) ns.gang.ascendMember(m.name);
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

		if (ns.gang.canRecruitMember()) ns.gang.recruitMember(selectRandom(names));
		break;
		await ns.sleep(10000)
	}
}

// Credit: Mysteyes. https://discord.com/channels/415207508303544321/415207923506216971/940379724214075442
/** @type {(mult:number) => number} */
function calculateAscendTreshold(mult)
{
	return 1.5 * mult;
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