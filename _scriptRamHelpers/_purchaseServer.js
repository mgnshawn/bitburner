import {setItem} from '/_helpers/ioHelpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	if(ns.args[0] !== undefined && ns.args[1] !== undefined && !isNaN(ns.args[1])) {
		
		let servername = ns.purchaseServer(ns.args[0],ns.args[1]);
		if(ns.args[2] !== undefined) {
			await setItem(ns,`server_purchase_name_${ns.args[2]}`,servername);
			await ns.sleep(1000);
		}
		await ns.sleep(1000);
	}
}