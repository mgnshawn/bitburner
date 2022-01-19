import {setItem}from '/_helpers/ioHelpers.js';
import {money} from '/_helpers/helpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('commitCrime');
	if(ns.args[0] !== undefined) {
		let crime = ns.args[0];
		let crimeInfo = ns.getCrimeStats(crime);
		
		let timeWait = ns.commitCrime(crime);
		setItem(ns,`commitCrime_${crime}_wait`,timeWait);
		await ns.sleep(250);
		ns.toast(`${crime}... $${money(crimeInfo.money)}`,'info',1500);
	}
}