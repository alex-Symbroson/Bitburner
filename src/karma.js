/** @param {NS} ns */
export async function main(ns)
{
	const req = -54000, karma = ns.heart.break();
	const t = karma - req;
	const sec = t % 60 | 0;
	const min = t / 60 % 60 | 0;
	const hrs = t / 360 | 0;

	ns.tprint(`${karma | 0}/${req}: ${t < 0 ? 'completed' : `${hrs}:${min}:${sec}`}`);
}