/** @param {NS} ns **/
var repThreshold = 15;
var timeCycle = 1 * 60;
var goToWarWhenChancesOver = 70
var purchaseHackingAugs = false;
var verbose = false;
// If a gang member's string is under the number it selects the highest option
//var jumpLevels = {"Train Combat":100,"Mug People":200, "Strongarm Civilians":250, "Armed Robbery":300, "Traffick Illegal Arms":400, "Human Trafficking":1200};
var jumpLevels = {"Mug People":50,"Train Combat":100,"Strongarm Civilians":325,"Territory Warfare":350,"Human Trafficking":900,"Terrorism":1500};

export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("getServerMoneyAvailable");
	ns.disableLog("gang.setMemberTask");
	ns.disableLog("gang.getGangInformation");
	ns.disableLog("gang.getMemberNames");
	ns.disableLog("gang.getMemberInformation");
	ns.disableLog("gang.getEquipmentCost");
	ns.disableLog("gang.purchaseEquipment");
	ns.disableLog("gang.ascendMember");
	ns.disableLog("gang.setTerritoryWarfare");
	ns.tail();
	for(let z=0;z<ns.args.length;z++) {
		if(ns.args[z] !== undefined) {
			if(ns.args[z] == 'v') {
				verbose = true;
			}
		}
	}
	var letCreate = false;
	while(!await ns.gang.inGang()) {
		if(ns.getPlayer().factions.includes("The Syndicate")) {
			ns.print("Joining The Syndicate");
			letCreate = await ns.gang.createGang("The Syndicate");
		} else if(ns.getPlayer().factions.includes("Slum Snakes")) {
			letCreate = await ns.gang.createGang("Slum Snakes");
		}
		if(letCreate) {
			ns.alert("Created your gang!");
			ns.print("CREATED GANG !!!!!");
		}
		await ns.sleep(60000);
	}



	var names = ['shawn','joe','mike','roger','snakes','acey','tony','bobby','billy','lance','sarah','heather','hilldawg','macy','larry'];
	var nameIndex = 0;	
	var members = ns.gang.getMemberNames();
	var recruitedLastRound = false;
	while(true) {
		if(members.length >= 12) {
			jumpLevels = {"Train Combat":250,"Terrorism":350,"Territory Warfare":400,"Human Trafficking":5900};
			if(ns.getServerMoneyAvailable("home") > 11000000000) {
				jumpLevels = {"Train Combat":300,"Vigilante Justice":350,"Territory Warfare":9900};
			}
		} else if(ns.gang.canRecruitMember()) {			
			var append = false;
			var newMember = "";
			for(var a = 0;a<names.length;a++) {
				if(!members.includes(names[a]) && newMember == "") {
					await ns.gang.recruitMember(names[a]);
					await ns.sleep(1000);
					recruitedLastRound = true;
					members = ns.gang.getMemberNames();
					newMember = names[a];	
					ns.print("Added gang member "+newMember);
					await ns.gang.setMemberTask(newMember,"Train Combat");
					break;				
				}
			}
		} else {
			if(recruitedLastRound == true) {
			ns.print("Can't recruit just yet. Trying again in "+(timeCycle*1000));
			
			}
		}
		await ns.print(" ");
		await ns.sleep(timeCycle*1000);
		await evalMemberAscend(ns);
		await evalMemberUpgrades(ns);
		await evalCurrentRep(ns);					
		await evalMemberTasks(ns);
		await evalGoToWar(ns);
		
		
	}
}

async function evalCurrentRep(ns) {
	let members = ns.gang.getMemberNames();
	var mygangInfo = ns.gang.getGangInformation();
	ns.print("Evaluating RepPenalty Level... "+Math.round(mygangInfo.wantedPenalty*100)/100);
	var thisMemberInfo = null;
	var prevTasks = Array();
	var hadToReBalance = false;
	for(var a=0; a < members.length; a++) {
		thisMemberInfo = ns.gang.getMemberInformation(members[a]);
		prevTasks[members[a]] = thisMemberInfo.task;
	}
	while(mygangInfo.wantedPenalty < (1-(repThreshold/100))) {
		hadToReBalance = true;
		ns.print(`  Rep Level: ${mygangInfo.wantedPenalty} ...Rebalancing Member Tasks`);
		ns.print(`   Current rate of wanted change: ${mygangInfo.wantedLevelGainRate}`);
		for(var a=0; a < members.length; a++) {			
			if(mygangInfo.wantedLevelGainRate > 0 ) {
				thisMemberInfo = ns.gang.getMemberInformation(members[a]);
				if((mygangInfo.respect / mygangInfo.wantedLevel) <= 2) {
					if(a == 0) { // First person needs to Mug for initial Rep offset
						await	ns.gang.setMemberTask(members[a],"Mug People");
						ns.print(`    setting ${members[a]} to Mug People`);
						mygangInfo = ns.gang.getGangInformation();
					}
					if((mygangInfo.wantedLevel - mygangInfo.respect) > 0 && a == 1) {
						await	ns.gang.setMemberTask(members[a],"Mug People");
						ns.print(`    setting ${members[a]} to Mug People`);
						mygangInfo = ns.gang.getGangInformation();
					}
				} 
				if(thisMemberInfo.task != "Vigilante Justice" && a != 0 && (ns.gang.getMemberNames().length < 3 || a != 1)) {
					await	ns.gang.setMemberTask(members[a],"Vigilante Justice");
					ns.print(`    setting ${members[a]} to Vigilante Justice`);
					mygangInfo = ns.gang.getGangInformation();
				}
			}
		}
		mygangInfo = ns.gang.getGangInformation();
		await ns.sleep(60000);
		await evalMemberUpgrades(ns);
	}
	if(hadToReBalance == true) {
		ns.print("_Re-assigning tasks");
		for(var a=0; a < members.length; a++) {			
			ns.print(`setting ${members[a]} back to ${prevTasks[members[a]]}`);
			await ns.gang.setMemberTask(members[a],prevTasks[members[a]]);
		}
	}
}

async function evalMemberTasks(ns) {
	let members = ns.gang.getMemberNames();
	var thisMemberInfo = null;
	let proceedDescDeets = chooseOrder(ns);
	let start = proceedDescDeets[0];
	let end = proceedDescDeets[1];
	let proceedDesc = proceedDescDeets[2];
	ns.print("Re-evaluating member tasks for harder tasks");
		for(var a=start; evalForOperation(proceedDesc, a, end); a=forOperation(proceedDesc,a)) {
			thisMemberInfo = ns.gang.getMemberInformation(members[a]);
			var destinationTask = "";
			for(var b = 0; b < Object.keys(jumpLevels).length; b++) {
				if(thisMemberInfo.str > jumpLevels[Object.keys(jumpLevels)[b]]) {
					continue;
				} else {
					//ns.print("evald "+thisMemberInfo.str+" against "+jumpLevels[Object.keys(jumpLevels)[b]]);
					if(members.length >= 12) {
						if((members[a] == 'shawn' || members[a] == 'joe' || members[a] == 'mike' || members[a] == 'joey') && thisMemberInfo.str > 1000) {							
							ns.print(` Forcing ${members[a]} to Territory Warfare`);
							ns.gang.setMemberTask(members[a],"Territory Warfare");		
							continue;
						}
					}
					if(destinationTask == "") {
						destinationTask = Object.keys(jumpLevels)[b];
						if(thisMemberInfo.task != Object.keys(jumpLevels)[b]) {
						ns.print(` Upgrading ${members[a]} to ${destinationTask}`);
						ns.gang.setMemberTask(members[a],destinationTask);		
						}				
					}
				}
			}
		}
}

async function evalMemberUpgrades(ns) {
	ns.print("Evaluating equipment purchase options");
	let members = ns.gang.getMemberNames();
	let equipmentList = [
        'Baseball Bat',
        'Bulletproof Vest',
        'Ford Flex V20',
        'Full Body Armor',
        'ATX1070 Superbike',
        'Katana',
        'Mercedes-Benz S9001',
        'Glock 18C',
		'P90C',
        'Steyr AUG',
        'Liquid Body Armor',        
        'White Ferrari',
        'Graphene Plating Armor',                
        'AK-47',
        'M15A10 Assault Rifle',
        'AWM Sniper Rifle',
		'Bionic Spine',
		'Bionic Arms',
		'Bionic Legs',
		'Nanofiber Weave',
		'BrachiBlades',
		'Synthetic Heart',
		'Synfibril Muscle',
		'Graphene Bone Lacings'
		
      ];
	  if(purchaseHackingAugs == true) {
		equipmentList.concat([
			'NUKE Rootkit',
			'Soulstealer Rootkit',
			'Demon Rootkit',
			'Hmap Node',
			'Jack the Ripper']);
	  }
	  var thisMemberInfo = null;
	  let proceedDescDeets = chooseOrder(ns);
	let start = proceedDescDeets[0];
	let end = proceedDescDeets[1];
	let proceedDesc = proceedDescDeets[2];
	  for( const equip of equipmentList) {
		  for(var a=start; evalForOperation(proceedDesc, a, end); a=forOperation(proceedDesc,a)) {
			thisMemberInfo = ns.gang.getMemberInformation(members[a]);
			if(!thisMemberInfo.upgrades.includes(equip)) {
				if(ns.getServerMoneyAvailable("home") > ns.gang.getEquipmentCost(equip)) {
					ns.print(` Buying ${equip} for ${members[a]}`);
					ns.gang.purchaseEquipment(members[a],equip);
				}
			}

	  }
	}
}

async function evalMemberAscend(ns) {
	var thisMemberInfo = null;
	let members = ns.gang.getMemberNames();
	ns.print("Evaluating members for ascention");
	var allowedAscendCount = Math.floor(members.length/2);
	var ascendCounter = 0;
	let gangInfo = ns.gang.getGangInformation();	
	let respectLeft = Math.floor(gangInfo.respect/2);
	let proceedDescDeets = chooseOrder(ns);
	let start = proceedDescDeets[0];
	let end = proceedDescDeets[1];
	let proceedDesc = proceedDescDeets[2];
	for(var a=start; evalForOperation(proceedDesc, a, end); a=forOperation(proceedDesc,a)) {
		//var ascend = false;
		thisMemberInfo = ns.gang.getMemberInformation(members[a]);
		if(thisMemberInfo.earnedRespect == undefined) {
			thisMemberInfo.earnedRespect = 0;
		}
		var ascendPotentional = ns.gang.getAscensionResult(members[a]);
		if(ascendPotentional !== null && ascendPotentional !== undefined) {
			if((gangInfo.respect - thisMemberInfo.earnedRespect) > gangInfo.wantedLevel) {
			if(ascendPotentional.str > 1.5 || ascendPotentional.dex > 1.3 || ascendPotentional.agi > 1.5) {
//				if(ascendCounter < allowedAscendCount && respectLeft > 0 && (gangInfo.respect/gangInfo.wantedLevel) > 7) {
					ns.print(` Ascending ${members[a]}`);
					await ns.gang.ascendMember(members[a]);
					await ns.sleep(150);
					gangInfo = ns.gang.getGangInformation();
					respectLeft = respectLeft - ascendPotentional.respect;
					ascendCounter++;
//				} else {
//					ns.print(" Ascending "+members[a]+" next time");
//				}
			} else {
				if(verbose) ns.print(` ascending ${members[a]} would incur too much loss on Gang rep`);
			}
			} else {
				if(verbose) ns.print(` ascending ${members[a]} would drop gang rep below wanted level.\n\t${gangInfo.respect} - ${thisMemberInfo.earnedRespect} > ${gangInfo.wantedLevel}`);
			}
		} else if(verbose) ns.print(` no ascention potential for ${members[a]}`);
	}
}
function chooseOrder (ns) {
	let members = ns.gang.getMemberNames();
	let proceedDesc = Math.random() < 0.5;
	let start = 0;
	let end = members.length;
	if(proceedDesc) {
		if(verbose)ns.print("  by descending order");
		start = members.length -1;
		end = 0;
	} else {
		if(verbose)ns.print("  by ascending order");
	}
	return [start,end, proceedDesc];
}

function forOperation(desc,value) {
	if(desc) {
		return --value;
	} else {
		return ++value;
	}
}
function evalForOperation(desc,value,value2) {
	if(desc) {
		return value > value2;
	} else {
		return value < value2;
	}
}

async function evalGoToWar(ns) {
	ns.print("Evaluation Territory Warefare");
	let otherGangs = ns.gang.getOtherGangInformation();
	let lowestChance = 100;
	let goToWar = false;
	for (const otherGang in otherGangs) {
		if(otherGang != ns.gang.getGangInformation().faction && otherGangs[otherGang].territory > 0) {
			let ourChance = ns.gang.getChanceToWinClash(otherGang);
			if(verbose)ns.print(`  Chance to win against ${otherGang} is ${ourChance}%`);
			if(ourChance < lowestChance) lowestChance = ourChance;
		}
	}
	if(lowestChance >= goToWarWhenChancesOver) {
		goToWar = true;
	}
	if(goToWar) {
		ns.print(` Enabling Territory Warfare: Our worstcase chance ${lowestChance.toLocaleString('en-US')}`);
		ns.gang.setTerritoryWarfare(true);
	} else {
		ns.print(` Disabling Territory Warfare: Our worstcase chance ${lowestChance.toLocaleString('en-US')}`);
		ns.gang.setTerritoryWarfare(false);
	}
}