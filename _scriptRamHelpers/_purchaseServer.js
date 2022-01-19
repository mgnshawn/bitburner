/** @param {NS} ns **/
export async function main(ns) {
	if(ns.args[0] !== undefined && ns.args[1] !== undefined && !isNaN(ns.args[1])) {
		ns.purchaseServer(ns.args[0],ns.args[1]);
		await ns.sleep(1000);
	}

}