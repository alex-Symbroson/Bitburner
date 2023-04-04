import { S } from "./util";

/** @param {NS} ns */
export async function main(ns)
{
	const answer = JSON.parse(String(ns.args[0]));
	const res = ns.codingcontract.attempt(answer, String(ns.args[1]), String(ns.args[2] || 'home'));
	if (res) ns.tprint('WARN ' + res);
	else ns.tprint(`ERROR ${ns.args[2] || 'home'}/${ns.args[1]} "${ns.args[3]}": ${ns.args[4]} => ${ns.args[0]}`);
}
