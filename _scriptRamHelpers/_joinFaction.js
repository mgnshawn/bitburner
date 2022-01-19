/** @param {NS} ns **/
export async function main(ns) {
	if(ns.args[0] !== undefined) {
		ns.joinFaction(ns.args[0]);
	}
}