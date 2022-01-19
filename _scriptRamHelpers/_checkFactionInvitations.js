import {setItem} from '/_helpers/ioHelpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	let facs = ns.checkFactionInvitations();
	await ns.sleep(250);
	if(facs !== null) {
		setItem(ns,'factionInvitations',facs);
		await ns.sleep(1000);
	}
}