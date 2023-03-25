/** @typedef {"strength"|"defense"|"agility"|"dexterity"} GymSt */
/** @param {NS} ns */
export async function main(ns)
{
	/** @type {Player} */
	var p;
	var tCur = 0;

	/** @type {GymSt[]} */
	const gymSt = ["strength", "defense", "agility", "dexterity"];
	/** @type {(a:GymSt, b:GymSt) => number} */
	const gymStCmp = (a, b) => p.skills[a] - p.skills[b];
	const nextGymSt = () => gymSt.sort(gymStCmp)[0];

	const actions = [
		new Action(
			() => p.skills.hacking < 50,
			() => ns.singularity.universityCourse("rothman university", "Algorithms")),
		new Action(
			() => !ns.fileExists("BruteSSH.exe"),
			() => ns.singularity.createProgram("BruteSSH.exe")),
		new Action(
			() => !ns.gang.inGang() && p.skills[nextGymSt()] < 30,
			() => ns.singularity.gymWorkout("Powerhouse Gym", nextGymSt()),
			() => ns.singularity.gymWorkout("Powerhouse Gym", nextGymSt())),
		/* new Action(
			() => !ns.gang.inGang(),
			() => ns.singularity.workForFaction("CyberSec", "hacking")), */
		new Action(
			() => !ns.gang.inGang() && p.money < 15e6,
			() => ns.singularity.commitCrime("Larceny")),
		new Action(
			() => !ns.gang.inGang(),
			() => ns.singularity.commitCrime("Homicide")),
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