import { setItem } from '/_helpers/ioHelpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('getCrimeChance');
	if (ns.args[0] !== undefined) {
		let crimeChance = ns.getCrimeChance(ns.args[0]);
		setItem(ns, `crime_${ns.args[0]}_chance`, crimeChance);
	}
}