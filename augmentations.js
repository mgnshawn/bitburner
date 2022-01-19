import { money } from '/_helpers/helpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	const factions = ['CyberSec', 'The Black Hand', 'Slum Snakes', 'The Syndicate', 'Tian Di Hui', 'BitRunners', 'New Tokyo', 'Sector-12', 'Tetrads', 'Tian Di Hui'];
	var augs = [];
	var sortBy = "";
	for(let n in ns.args) {
		if(ns.args[n] == sortby && ns.args[n+1] !== undefined) {
			sortBy = ns.args[n+1];
		}
	}


	factions.forEach(fac => {
		let augsInFac = [];
		let facAugs = ns.getAugmentationsFromFaction(fac);
		facAugs.forEach(aug => {
			let price = ns.getAugmentationPrice(aug);
			let repReq = ns.getAugmentationRepReq(aug);
			let augStats = ns.getAugmentationStats(aug);
			augStats.price = price;
			augStats.repReq = repReq;
			augStats.faction = fac;
			let obj = {};
			obj[aug] = augStats;
			augsInFac.push({ 'name': aug, 'stats': augStats, 'price': price, 'repRequired': repReq, 'faction': fac });
		});
		let fobj = {};
		fobj[fac] = augsInFac;
		augs.push(fobj);
	});
	for(let aug in augs) {
		let faction = Object.keys(augs[aug])[0];
		let augsInFaction = augs[aug][faction];
		let liner = "=";
		ns.tprintf(`\n\n%-50s ::::::........\n`,faction);
		ns.tprintf(`%-90s\n`,liner.padEnd(200,'='));
		drawAugs(ns, augsInFaction);
	}
}

function drawAugs(ns, augmentation) {
	const row = '%-50s | %12s | %12s | %s';
	ns.tprintf(row, 'Augmentation', 'Rep Required', 'Price', 'Stats');
	ns.tprintf(row, '---------', '-------', '------', '------');
	for (const aug of augmentation) {

		let augStatString = "";
		for (let statIndex = 0; statIndex < Object.keys(aug.stats).length; statIndex++) {
			if (!['price', 'repReq', 'faction'].includes(Object.keys(aug.stats)[statIndex]) && !Object.keys(aug.stats)[statIndex].includes("hacknet")) {
				if (statIndex == 0)
					augStatString += `${Object.keys(aug.stats)[statIndex].padEnd(20)} :: ${aug.stats[Object.keys(aug.stats)[statIndex]].toString().padEnd(5)}   `;
				else {
					if (statIndex % 5 != 0) {
						augStatString += `${Object.keys(aug.stats)[statIndex].padEnd(20)} :: ${aug.stats[Object.keys(aug.stats)[statIndex]].toString().padEnd(5)}   `;
					}
					else if(statIndex != Object.keys(aug.stats).length){
						augStatString += `\n${" ".padEnd(83)}`;
					}
				}
			}
		}
		ns.tprintf(row, aug.name,
			ns.nFormat(aug.repRequired, '0,0'),
			ns.nFormat(aug.price, '($ 0.00 a)'),
			augStatString
		);
	}
}