/** @param {NS} ns **/
var repThreshold = 10;
var timeCycle = 180;
// If a gang member's string is under the number it selects the highest option
//var jumpLevels = {"Train Combat":100,"Mug People":200, "Strongarm Civilians":250, "Armed Robbery":300, "Traffick Illegal Arms":400, "Human Trafficking":1200};
var jumpLevels = {"Train Combat":100,"Vigilante Justice":175,"Territory Warfare":350,"Human Trafficking":900,"Terrorism":1500};

export async function main(ns) {
	while(!await ns.gang.inGang()) {
		let letCreate = await ns.gang.createGang("Slum Snakes");
		if(letCreate) {
			ns.alert("Created your gang!");
			ns.tprint("CREATED GANG !!!!!");
		}
		await ns.sleep(60000);
	}



	var names = ['shawn','joe','mike','roger','snakes','acey','tony','bobby','billy','lance','sarah','heather','hilldawg','macy','larry'];
	var nameIndex = 0;	
	var members = ns.gang.getMemberNames();
	while(true) {
		if(members.length >= 12) {
			jumpLevels = {"Train Combat":300,"Vigilante Justice":350,"Territory Warfare":400,"Human Trafficking":5900};
			if(ns.getServerMoneyAvailable("home") > 11000000000) {
				jumpLevels = {"Train Combat":300,"Vigilante Justice":350,"Territory Warfare":9900};
			}
		}
		if(ns.gang.canRecruitMember()) {			
			var append = false;
			var newMember = "";
			for(var a = 0;a<names.length;a++) {
				if(!members.includes(names[a]) && newMember == "") {
					ns.gang.recruitMember(names[a]);
					newMember = names[a];					
				}
			}
			while(newMember == "") {
				var counter = 2;
				for(var a = 0;a<names.length;a++) {
					if(!members.includes(names[a]+"_"+counter) && newMember == "") {
						ns.gang.recruitMember(names[a]+"_"+counter);
						newMember = names[a]+"_"+counter;
					}
				}
				counter++;
			}
						ns.tprint("Added gang member "+newMember);
						ns.gang.setMemberTask(newMember,"Train Combat");
		}
		else {
			ns.tprint("Can't recruit just yet");
			await evalCurrentRep(ns,members);			
			await evalMemberAscend(ns,members);
			await evalMemberTasks(ns,members);
			await evalMemberUpgrades(ns,members);
			await ns.sleep(timeCycle*1000);
		}
		await ns.tprint(" ");
		
		
	}
}

async function evalCurrentRep(ns,members) {
	var mygangInfo = ns.gang.getGangInformation();
	ns.tprint(" Evaluating RepPenalty Level... "+Math.round(mygangInfo.wantedPenalty*100)/100);
	var thisMemberInfo = null;
	var prevTasks = Array();
	var hadToReBalance = false;
	for(var a=0; a < members.length; a++) {
		thisMemberInfo = ns.gang.getMemberInformation(members[a]);
		prevTasks[members[a]] = thisMemberInfo.task;
	}
	while(mygangInfo.wantedPenalty < (1-(repThreshold/100))) {
		hadToReBalance = true;
		ns.tprint("  Rep Level: "+mygangInfo.wantedPenalty+" ...Rebalancing Member Tasks");
		ns.tprint("   Current rate of wanted change: "+mygangInfo.wantedLevelGainRate);
		for(var a=0; a < members.length; a++) {			
			if(mygangInfo.wantedLevelGainRate > 0 ) {
				thisMemberInfo = ns.gang.getMemberInformation(members[a]);
				if(thisMemberInfo.task != "Vigilante Justice") {
					await	ns.gang.setMemberTask(members[a],"Vigilante Justice");
					ns.tprint("    setting "+members[a]+" to Vigilante Justice");
					mygangInfo = ns.gang.getGangInformation();
				}
			}
		}
		mygangInfo = ns.gang.getGangInformation();
		await ns.sleep(60000);
	}
	if(hadToReBalance == true) {
		ns.tprint(" Re-assigning tasks");
		for(var a=0; a < members.length; a++) {			
			ns.tprint("  setting "+members[a]+" back to "+prevTasks[members[a]]);
			await ns.gang.setMemberTask(members[a],prevTasks[members[a]]);
		}
	}
}

async function evalMemberTasks(ns,members) {
	var thisMemberInfo = null;
	ns.tprint(" Re-evaluating member tasks for harder tasks");
		for(var a=0; a < members.length; a++) {
			thisMemberInfo = ns.gang.getMemberInformation(members[a]);
			var destinationTask = "";
			for(var b = 0; b < Object.keys(jumpLevels).length; b++) {
				if(thisMemberInfo.str > jumpLevels[Object.keys(jumpLevels)[b]]) {
					continue;
				} else {
					//ns.tprint("evald "+thisMemberInfo.str+" against "+jumpLevels[Object.keys(jumpLevels)[b]]);
					if(members.length >= 12) {
						if((members[a] == 'shawn' || members[a] == 'joe' || members[a] == 'mike' || members[a] == 'joey') && thisMemberInfo.str > 1000) {							
							ns.tprint("  Forcing "+members[a]+" to Territory Warfare");
							ns.gang.setMemberTask(members[a],"Territory Warfare");		
							continue;
						}
					}
					if(destinationTask == "") {
						destinationTask = Object.keys(jumpLevels)[b];
						if(thisMemberInfo.task != Object.keys(jumpLevels)[b]) {
						ns.tprint("  Upgrading "+members[a]+" to "+destinationTask);
						ns.gang.setMemberTask(members[a],destinationTask);		
						}				
					}
				}
			}
		}
}

async function evalMemberUpgrades(ns,members) {
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
					ns.tprint(" Buying "+equip+" for "+members[a]);
					ns.gang.purchaseEquipment(members[a],equip);
				}
			}

	  }
	}
}

async function evalMemberAscend(ns,members) {
	var thisMemberInfo = null;
	ns.tprint(" Evaluating members for ascention");
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
					ns.tprint(" Ascending "+members[a]);
					ns.gang.ascendMember(members[a]);
					respectLeft = respectLeft - ascendPotentional.respect;
					ascendCounter++;
				} else {
					ns.tprint(" Ascending "+members[a]+" next time");
				}
			}
		}
	}
}
