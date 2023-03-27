
/** @typedef {"strength"|"defense"|"agility"|"dexterity"} GymSt */

import { task } from "./utilTask";

/** @param {NS} ns */
export async function main(ns)
{
	var p = ns.getPlayer();
	var tCur = 0;

	/** @type {GymSt[]} */
	const gymSt = ["strength", "defense", "agility", "dexterity"];
	/** @type {(a:GymSt, b:GymSt) => number} */
	const gymStCmp = (a, b) => p.skills[a] - p.skills[b];
	const nextGymSt = () => gymSt.sort(gymStCmp)[0];
	const naug = Number(ns.read('naug.dat'));

	const actions = [
		new Action(
			() => p.skills.hacking < 50,
			() => task(ns, "uni", "rothman university", "Algorithms")),
		new Action(
			() => !ns.fileExists("BruteSSH.exe"),
			() => task(ns, "cprog", "BruteSSH.exe")),
		new Action(
			() => !ns.gang.inGang() && p.skills[nextGymSt()] < 30,
			() => task(ns, "gym", "Powerhouse Gym", nextGymSt()),
			() => task(ns, "gym", "Powerhouse Gym", nextGymSt())),
		new Action(
			() => !ns.gang.inGang() && p.money < 15e6,
			() => task(ns, "crime", "Larceny")),
		new Action(
			() => !ns.gang.inGang() && (ns.heart.break() < ([10e3, 25e3][naug] || 1e9)),
			() => task(ns, "crime", "Homicide")),
	];

	/** @type {Action} */
	let action = actions[0], tStart = 0;
	while (true)
	{
		await ns.asleep(5000);

		const tNow = Date.now();
		tCur = tNow - tStart;
		p = ns.getPlayer();

		while (action && !action.todo()) action = actions.shift();
		if (!action) break;

		if (!action.active)
		{
			ns.tprint(action.init);
			action.init();
			action.active = true;
		}
		else action.repeat();
	}
	ns.tprint("walk done. spawning work");
	ns.spawn("work.js");
}

const nop = () => { };
const nob = () => false;
class Action
{
	constructor(todo = nob, init = nop, repeat = nop)
	{
		this.todo = todo;
		this.init = init;
		this.repeat = repeat;
		this.active = false;
	}
}