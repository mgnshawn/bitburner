import {setItem} from '/ioHelpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	let ps = ns.getPurchasedServers();
	await ns.sleep(250);
setItem(ns,'purchasedServers',ps);
await ns.sleep(1000);
}