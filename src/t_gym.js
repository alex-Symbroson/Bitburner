
/** @param {NS} ns */
export async function main(ns)
{
    ns.singularity.gymWorkout(String(ns.args[0]), String(ns.args[1]));
}