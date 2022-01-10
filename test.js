/** @param {NS} ns **/
export async function main(ns) {
	let t = {'CSEC':'CyberDic'};
	ns.tprint(ns.getAugmentationsFromFaction('CyberSec'));
	ns.tprint(ns.getServer(Object.keys(t)[0]));
	ns.tprint(ns.getOwnedAugmentations());
	ns.tprint(ns.getPlayer());
ns.tprint("---------------------------");
	let otherGangs = ns.gang.getOtherGangInformation();
	ns.tprint(otherGangs);
	let lowestChance = 1;
	let goToWar = false;
	for (const otherGang in otherGangs) {
		ns.tprint(otherGangs[otherGang]);
	}

}