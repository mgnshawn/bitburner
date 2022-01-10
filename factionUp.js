var AugsInOrder = [];
	AugsInOrder.push({'CyberSec':["Synaptic Enhancement Implant","Neurotrainer I", "BitWire"]});
	AugsInOrder.push({'Tian Di Hui':['Social Negotiation Assistant (S.N.A)',  'ADR-V1 Pheromone Gene']});
	AugsInOrder.push({'CyberSec':['Cranial Signal Processors - Gen I','Cranial Signal Processors - Gen II']});
	AugsInOrder.push({'Aevum':['PCMatrix']});
	AugsInOrder.push({'Sector-12':['Neuralstimulator']});
	AugsInOrder.push({'The Syndicate':["The Shadow's Simulacrum","Power Recirculation Core"]});
	AugsInOrder.push({'CyberSec':['Upgrade']});
	var toJoinFaction = {'CyberSec':'CSEC', 'Tian Di Hui':'New Tokyo', 'Aevum':'Aevum', 'Sector-12':'Sector-12','The Syndicate':'Aevum'};
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerRequiredHackingLevel');
    ns.disableLog('getScriptRam');
    ns.disableLog('getPlayer');
    ns.disableLog('getPurchasedServers');
    ns.disableLog('getPurchasedServerLimit');
    ns.disableLog('getServerNumPortsRequired');
    ns.disableLog('scan');
	
	let workToDo = "hacking contracts";
	



	ns.tail();
	//ns.run('crimeItUp.js',1,"auto",'l');
	ns.print("Starting to crime it up for initial money");
	
	

	var inActiveRound = false;
	for(var AugIndex=0;AugIndex < AugsInOrder.length; AugIndex++) {
	let faction = Object.keys(AugsInOrder[AugIndex])[0];
	let Augs = AugsInOrder[AugIndex][faction];
		await checkFactionMemberShipAndJoin(ns,faction);
	
				for(var aug = 0; aug < Augs.length; aug++) {
					let currentAug = Augs[aug];
					if(currentAug == "Upgrade") {
						await runUpgradeLoop(ns);
						inActiveRound = true;
					} else {
					if(!ns.getOwnedAugmentations(true).includes(currentAug)) {
						inActiveRound = true;
						ns.stopAction();
						ns.print("[Faction|| "+faction+" [Aug|| "+currentAug+ " Requires $"+ns.getAugmentationPrice(currentAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(currentAug).toLocaleString("en-US")+" Rep");
			
						let repNeeded = ns.getAugmentationRepReq(currentAug);
						while(ns.getFactionRep(faction) < repNeeded) {
							ns.print("Working for rep. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining rep needed: " + (ns.getAugmentationRepReq(currentAug) - ns.getFactionRep(faction)).toLocaleString("en-US"));
							ns.workForFaction(faction, workToDo);
    						await ns.sleep(60000);
						}
						while (!ns.getOwnedAugmentations(true).includes(currentAug)) {
							if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(currentAug)) {
								ns.print("Purchasing "+currentAug+" from "+faction);
								let succ = ns.purchaseAugmentation(faction, currentAug);
								if(succ) {
									ns.print("Purchased Aug: "+currentAug);
								}
							} else {
								ns.print("Criming for money. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining needed $"+(ns.getAugmentationPrice(currentAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US"));								
								ns.stopAction();
								if((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) < ns.getScriptRam("crimeItUp.js")) {
									await ns.scriptKill("hackit.js","home");
								}
								if(!ns.scriptRunning('crimeItUp.js','home')) {
									await ns.run('crimeItUp.js',1,"auto","s");
								}
							}
							await ns.sleep(30000);
						}		
					}
					}
				}
				if(inActiveRound) {
					break;
				}


	}	
	
	
	if(ns.heart.break()<35000) {
		ns.print("Installing Augmentations");	
		ns.enableLog('sleep');
		//ns.installAugmentations('init.js');
	} else {
		ns.print("Riding out this reboot for Gang creation");
		while(!ns.gang.inGang()) {
			await ns.sleep('60000') 
			ns.print(`Karma ${ns.heart.break()}`);
		}
	}
	ns.enableLog('sleep');
}	

async function runUpgradeLoop(ns) {
	let gradeUpAug = "NeuroFlux Governor";
	let workToDo = "hacking contracts";
	for(let countit = 1;countit <= 2;countit++) {
		ns.stopAction();
		let onToNext = false;
		ns.print("GradeUp Aug "+gradeUpAug+" "+countit+ " Requires $"+ns.getAugmentationPrice(gradeUpAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(gradeUpAug)+" Rep");
		let repNeeded = ns.getAugmentationRepReq(gradeUpAug);
		while(ns.getFactionRep('CyberSec') < repNeeded) {
			ns.print("Working for rep. Remaining rep needed: " + (ns.getAugmentationRepReq(gradeUpAug) - ns.getFactionRep('CyberSec').toLocaleString("en-US")));
			ns.workForFaction('CyberSec', workToDo);
    		await ns.sleep(60000);
		}
		do {			
			if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(gradeUpAug)) {
				let succ = ns.purchaseAugmentation('CyberSec', gradeUpAug);
				if(succ) {
					ns.print("Purchased Aug: ".gradeUpAug);
					onToNext = true;
				}
			}	else {
					ns.print("Criming for money. Remaining needed $"+(ns.getAugmentationPrice(gradeUpAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US"));
					if(!ns.isBusy()) {
						ns.stopAction();
						if((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) < ns.getScriptRam("crimeItUp.js")) {
							await ns.scriptKill("hackit.js","home");
						}
						if(!ns.scriptRunning('crimeItUp.js','home')) {
							await ns.run('crimeItUp.js',1,"auto","l");
						}
					}
				}
			await ns.sleep(10000);
		} while (onToNext == false);
		await ns.stopAction();
	}
}

function findCSEC(ns) {
	var connectionsp = ns.scan("home");
    var connections = [];
	var parentHop = "";
	for(var c = 0; c < connectionsp.length;c++) {                
            let level1 = ns.scan(connectionsp[c]);			
			if(!level1.includes("CSEC")) {
				continue;
			} else {
				parentHop = connectionsp[c];
			}
    }
	return parentHop;
}

async function checkFactionMemberShipAndJoin(ns,faction) {
	if(!ns.getPlayer().factions.includes(faction)) {
		if(toJoinFaction[faction] == 'CSEC') {
			while(!ns.getServer(toJoinFaction[faction]).backdoorInstalled) {		
				ns.print("Waiting to install backdoor on CSEC");
				if(ns.getServer(toJoinFaction[faction])["hasAdminRights"]) {							
					var parent = findCSEC(ns);
					ns.connect(parent);
					await ns.sleep(500);
					ns.connect(toJoinFaction[faction]);
					await ns.sleep(100);
					var succ = await ns.installBackdoor();
					if(succ) {
						ns.print("Installing backdoor on "+toJoinFaction[faction]);
						ns.connect(parent);
						await ns.sleep(1000);
						ns.connect('home');
					}
				}
				await ns.sleep(60000);
			} 
			while(!ns.getPlayer().factions.includes(faction)) {
				ns.print("Waiting to join "+faction);
				if(ns.checkFactionInvitations().includes(faction)) {
					var succ = ns.joinFaction(faction);
					if(succ) {
						ns.print("   ...Joined "+faction);
					}
				}
				await ns.sleep(5000);
			}
		} else if (['New Tokyo','Aevum','Sector-12'].includes(toJoinFaction[faction])) {
			while(!ns.getPlayer().factions.includes(faction)) {
				if(ns.getPlayer().city == toJoinFactio[faction] || ns.getServerMoneyAvailable("home") >= 200000) {
					if(ns.getPlayer().city != toJoinFaction[faction]) {
						ns.travelToCity(toJoinFaction[faction]);
					}
					await ns.sleep(10000);
					if(ns.checkFactionInvitations().includes(faction)) {
						var succ = ns.joinFaction(faction);
						if(succ) {
							ns.print("   ...Joined "+faction);
						}
					} else {
						ns.print("waiting for invitation to "+faction);
					}
				
				} else {
					ns.print("waiting for enough money to travel to "+toJoinFaction[faction]);
				}
				await ns.sleep(5000);
			}
		}
	}
}
