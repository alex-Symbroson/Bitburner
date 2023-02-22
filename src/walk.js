
/** @typedef {"strength"|"defense"|"agility"|"dexterity"} GymSt */
/** @param {NS} ns */
export async function main(ns)
{
	/** @type {Player} */
	var p;
	var tCur = 0;

    /** @type {GymSt[]} */
	const gymSt = ["strength","defense","agility","dexterity"];
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
			() => p.skills[nextGymSt()] < 30,
			() => ns.singularity.gymWorkout("powerhouse", nextGymSt())),
		new Action(
			() => !ns.gang.inGang(),
			() => ns.singularity.workForFaction("CyberSec", "hacking")),
		new Action(() => p.money > 15e6, () => 0),
		new Action(
			() => !ns.gang.inGang(),
			() => ns.singularity.commitCrime("Homicide")),
	];

	/** @type {Action} */
	let action, tStart = 0;
	while (true)
	{
		await ns.asleep(5);
		const tNow = Date.now();

		while (!action.todo())
			if (action = actions.shift()) tStart = tNow;
			else break;

		tCur = tNow - tStart;
		p = ns.getPlayer();
		action.act();
	}
}

class Action
{
	constructor(todo, act)
	{
		this.todo = todo;
		this.act = act;
	}
}