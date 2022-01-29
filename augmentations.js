import { money } from '/_helpers/helpers.js';
/** @type import(".").NS */
let ns = null;
const argSchema = [
	['faction',''],
	['sort', ['exp','cost','name','faction']],
	];
	var augArgs = {'onlyFaction':null,'sortBy':null,'find':null};

/** @param {NS} ns **/
export async function main(_ns) {
	ns=_ns;
	const factions = ['CyberSec', 'The Black Hand', 'Slum Snakes', 'The Syndicate', 'Tian Di Hui', 'BitRunners', 'New Tokyo', 'Sector-12', 'Tetrads', 'Tian Di Hui'];
	var augs = [];
	var sortBy = "";

	for(let n in ns.args) {
		let argParts = ns.args[n].split("=");
		if(argParts.length == 2) {
		augArgs[argParts[0]] = argParts[1];
		}
	}


	let _augs = [];

	factions.forEach(fac => {
		ns.getAugmentationsFromFaction(fac).forEach(aug => {
			let price = ns.getAugmentationPrice(aug);
			let repReq = ns.getAugmentationRepReq(aug);
			let augStats = ns.getAugmentationStats(aug);
			let augFaction = fac;
			_augs.push({'augmentation':aug,'faction':augFaction,'price':price,'requiredRep':repReq,'stats':augStats});
			
		});
	});
	//ns.tprint(JSON.stringify(_augs,null,3));
if(augArgs.sortBy !== null && augArgs.sortBy == "augmentation") {
	_augs.sort(function(a, b) {
		var nameA = a.augmentation.toUpperCase(); // ignore upper and lowercase
		var nameB = b.augmentation.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB) {
		  return -1;
		}
		if (nameA > nameB) {
		  return 1;
		}

		return 0;
	  });
	}
	if(augArgs.sortBy !== null && augArgs.sortBy == "faction") {
		_augs.sort(function(a, b) {
			var nameA = a.faction.toUpperCase(); // ignore upper and lowercase
			var nameB = b.faction.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
			  return -1;
			}
			if (nameA > nameB) {
			  return 1;
			}
		  
			// names must be equal
			return 0;
		  });
		}
	
	
	  if(augArgs.sortBy !== null && augArgs.sortBy == "price") {
	  _augs.sort(function(a, b) {
		  return a.price - b.price;
		
	  });
	  _augs.map(obj => {
		  obj.price = money(obj.price);
		return obj;
	  });	  
	}
	

	if(augArgs.onlyFaction !== null) {


		var byFac =_augs.filter(function(au) {
			return au.faction.toLowerCase().indexOf(augArgs.onlyFaction.toLowerCase()) !== -1});
			ns.tprint(JSON.stringify(byFac,null,3));
			ns.exit();

	}
	ns.tprint(JSON.stringify(_augs,null,3));
	  ns.exit();

_augs.sort
	for(let aug in augs) {
		let faction = Object.keys(augs[aug])[0];
		let augsInFaction = augs[aug][faction];
		let liner = "=";
		ns.tprintf(`\n\n%-50s ::::::........\n`,faction);
		ns.tprintf(`%-90s\n`,liner.padEnd(200,'='));
		drawAugs(ns, augsInFaction);
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