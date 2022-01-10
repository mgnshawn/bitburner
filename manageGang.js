/** @param {NS} ns **/
var repThreshold = 15;
var timeCycle = 2 * 60;
// If a gang member's string is under the number it selects the highest option
//var jumpLevels = {"Train Combat":100,"Mug People":200, "Strongarm Civilians":250, "Armed Robbery":300, "Traffick Illegal Arms":400, "Human Trafficking":1200};
var jumpLevels = {"Mug People":50,"Train Combat":100,"Vigilante Justice":175,"Territory Warfare":350,"Human Trafficking":900,"Terrorism":1500};

export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("getServerMoneyAvailable");
	ns.disableLog("gang.setMemberTask");
	ns.disableLog("gang.getGangInformation");
	ns.disableLog("gang.getMemberNames");
	ns.disableLog("gang.getMemberInformation");
	ns.disableLog("gang.getEquipmentCost");
	ns.disableLog("gang.purchaseEquipment");
	ns.tail();
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
			jumpLevels = {"Train Combat":300,"Vigilante Justice":350,"Territory Warfare":400,"Human Trafficking":5900};
			if(ns.getServerMoneyAvailable("home") > 11000000000) {
				jumpLevels = {"Train Combat":300,"Vigilante Justice":350,"Territory Warfare":9900};
			}
		} else if(ns.gang.canRecruitMember()) {			
			var append = false;
			var newMember = "";
			for(var a = 0;a<names.length;a++) {
				if(!members.includes(names[a]) && newMember == "") {
					ns.gang.recruitMember(names[a]);
					recruitedLastRound = true;
					members = ns.gang.getMemberNames();
					newMember = names[a];	
					break;				
				}
			}
			
				
				for(var a = 0;a<names.length;a++) {
					if(!members.includes(names[a]+"_"+(a+2))) {
						ns.gang.recruitMember(names[a]+"_"+(a+2));
						recruitedLastRound = true;
						members = ns.gang.getMemberNames();	
						newMember = names[a]+"_"+(a+2);
						break;
					}
				}
				
			
						ns.print("Added gang member "+newMember);
						ns.gang.setMemberTask(newMember,"Train Combat");
		} else {
			if(recruitedLastRound == true) {
			ns.print("Can't recruit just yet. Trying again in "+(timeCycle*1000));
			
			}
		}
		await ns.print(" ");
		await ns.sleep(timeCycle*1000);
		await evalMemberAscend(ns,members);
		await evalMemberUpgrades(ns,members);
		await evalCurrentRep(ns,members);					
		await evalMemberTasks(ns,members);
		
		
		
	}
}

async function evalCurrentRep(ns,members) {
	var mygangInfo = ns.gang.getGangInformation();
	ns.print(" Evaluating RepPenalty Level... "+Math.round(mygangInfo.wantedPenalty*100)/100);
	var thisMemberInfo = null;
	var prevTasks = Array();
	var hadToReBalance = false;
	for(var a=0; a < members.length; a++) {
		thisMemberInfo = ns.gang.getMemberInformation(members[a]);
		prevTasks[members[a]] = thisMemberInfo.task;
	}
	while(mygangInfo.wantedPenalty < (1-(repThreshold/100))) {
		hadToReBalance = true;
		ns.print("  Rep Level: "+mygangInfo.wantedPenalty+" ...Rebalancing Member Tasks");
		ns.print("   Current rate of wanted change: "+mygangInfo.wantedLevelGainRate);
		for(var a=0; a < members.length; a++) {			
			if(mygangInfo.wantedLevelGainRate > 0 ) {
				thisMemberInfo = ns.gang.getMemberInformation(members[a]);
				if((mygangInfo.respect / mygangInfo.wantedLevel) <= 2) {
					if(a == 0) { // First person needs to Mug for initial Rep offset
						await	ns.gang.setMemberTask(members[a],"Mug People");
						ns.print("    setting "+members[a]+" to Mug People");
						mygangInfo = ns.gang.getGangInformation();
					}
				}
				if(thisMemberInfo.task != "Vigilante Justice" && a != 0) {
					await	ns.gang.setMemberTask(members[a],"Vigilante Justice");
					ns.print("    setting "+members[a]+" to Vigilante Justice");
					mygangInfo = ns.gang.getGangInformation();
				}
			}
		}
		mygangInfo = ns.gang.getGangInformation();
		await ns.sleep(60000);
	}
	if(hadToReBalance == true) {
		ns.print(" Re-assigning tasks");
		for(var a=0; a < members.length; a++) {			
			ns.print("  setting "+members[a]+" back to "+prevTasks[members[a]]);
			await ns.gang.setMemberTask(members[a],prevTasks[members[a]]);
		}
	}
}

async function evalMemberTasks(ns,members) {
	var thisMemberInfo = null;
	ns.print(" Re-evaluating member tasks for harder tasks");
		for(var a=0; a < members.length; a++) {
			thisMemberInfo = ns.gang.getMemberInformation(members[a]);
			var destinationTask = "";
			for(var b = 0; b < Object.keys(jumpLevels).length; b++) {
				if(thisMemberInfo.str > jumpLevels[Object.keys(jumpLevels)[b]]) {
					continue;
				} else {
					//ns.print("evald "+thisMemberInfo.str+" against "+jumpLevels[Object.keys(jumpLevels)[b]]);
					if(members.length >= 12) {
						if((members[a] == 'shawn' || members[a] == 'joe' || members[a] == 'mike' || members[a] == 'joey') && thisMemberInfo.str > 1000) {							
							ns.print("  Forcing "+members[a]+" to Territory Warfare");
							ns.gang.setMemberTask(members[a],"Territory Warfare");		
							continue;
						}
					}
					if(destinationTask == "") {
						destinationTask = Object.keys(jumpLevels)[b];
						if(thisMemberInfo.task != Object.keys(jumpLevels)[b]) {
						ns.print("  Upgrading "+members[a]+" to "+destinationTask);
						ns.gang.setMemberTask(members[a],destinationTask);		
						}				
					}
				}
			}
		}
}

async function evalMemberUpgrades(ns,members) {
	ns.print(" Evaluating equipment purchase options");
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
		'Graphene Bone Lacings',
		'NUKE Rootkit',
		'Soulstealer Rootkit',
		'Demon Rootkit',
		'Hmap Node',
		'Jack the Ripper'
		
      ];
	  var thisMemberInfo = null;
	  for( const equip of equipmentList) {
		  for(var a=0; a < members.length; a++) {
			thisMemberInfo = ns.gang.getMemberInformation(members[a]);
			if(!thisMemberInfo.upgrades.includes(equip)) {
				if(ns.getServerMoneyAvailable("home") > ns.gang.getEquipmentCost(equip)) {
					ns.print(" Buying "+equip+" for "+members[a]);
					ns.gang.purchaseEquipment(members[a],equip);
				}
			}

	  }
	}
}

async function evalMemberAscend(ns,members) {
	var thisMemberInfo = null;
	ns.print(" Evaluating members for ascention");
	var allowedAscendCount = Math.floor(members.length/2);
	var ascendCounter = 0;
	var gangInfo = ns.gang.getGangInformation();
	var respectLeft = Math.floor(gangInfo.respect/2);
	for(var a=0; a < members.length; a++) {
		var ascend = false;
		thisMemberInfo = ns.gang.getMemberInformation(members[a]);

		var ascendPotentional = ns.gang.getAscensionResult(members[a]);
		if(ascendPotentional !== null && ascendPotentional !== undefined) {
			if(ascendPotentional.str > 1.12 || ascendPotentional.dex > 1.3 || ascendPotentional.agi > 1.5) {
				if(ascendCounter < allowedAscendCount && respectLeft > 0 && (gangInfo.respect/gangInfo.wantedLevel) > 7) {
					ns.print(" Ascending "+members[a]);
					ns.gang.ascendMember(members[a]);
					respectLeft = respectLeft - ascendPotentional.respect;
					ascendCounter++;
				} else {
					ns.print(" Ascending "+members[a]+" next time");
				}
			}
		}
	}
}