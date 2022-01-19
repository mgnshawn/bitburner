import {setItem}from '/ioHelpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('commitCrime');
	if(ns.args[0] !== undefined) {
		ns.toast(`Committing ${ns.args[0]}`,'info',1000);
		let timeWait = ns.commitCrime(ns.args[0]);
		setItem(ns,`commitCrime_${ns.args[0]}_wait`,timeWait);
		await ns.sleep(250);
	}
}