var AugsInOrder = [];
	AugsInOrder =[{'CyberSec':["Synaptic Enhancement Implant", "BitWire", "Neurotrainer I"]}];
	//AugsInOrder.push({'Tian Di Hui':['Upgrade','Upgrade']});
	AugsInOrder.push({'Tian Di Hui':['Social Negotiation Assistant (S.N.A)',  'ADR-V1 Pheromone Gene']});
	AugsInOrder.push({'CyberSec':['Cranial Signal Processors - Gen I','Cranial Signal Processors - Gen II']});			
	AugsInOrder.push({'The Syndicate':["The Shadow's Simulacrum","Power Recirculation Core",'Neurotrainer II']});
	AugsInOrder.push({'The Syndicate':['The Black Hand','Neuregen Gene Modification','CRTX42-AA Gene Modification','Neurotrainer III','Artificial Synaptic Potentiation']});
	AugsInOrder.push({'Aevum':['PCMatrix']});
	AugsInOrder.push({'The Syndicate':['Cranial Signal Processors - Gen IV','Cranial Signal Processors - Gen V','Neuralstimulator','Neural Accelerator','DataJack','Neural-Retention Enhancement']});
	AugsInOrder.push({'The Syndicate':['OmniTek InfoLoad','SPTN-97 Gene Modification','Neuronal Densification','Artificial Bio-neural Network Implant','Enhanced Myelin Sheathing']});
	AugsInOrder.push({'CyberSec':['Upgrade']});
	AugsInOrder.push({'The Syndicate':['PC Direct-Neural Interface NeuroNet Injector','PC Direct-Neural Interface Optimization Submodule']});
	AugsInOrder.push({'Daedalus':['The Red Pill']});
	
	var toJoinFaction = {'CyberSec':'CSEC', 'Tian Di Hui':'New Tokyo', 'Aevum':'Aevum', 'Sector-12':'Sector-12','The Syndicate':'Aevum','Daedalus':'New Toky'};
	var autoWork = false;
	var upgradesPerJob = 3;
	/*
"The Shadow's Simulacrum",
	*/
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
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('workForFaction');
    ns.disableLog('scan');
	
	let workToDo = "hacking contracts";
	for(let AugObjIndex in AugsInOrder) {
		for(let FacListObj in AugsInOrder[AugObjIndex]) {
			for(let _AugIndex in AugsInOrder[AugObjIndex][FacListObj]) {
				let _Aug = AugsInOrder[AugObjIndex][FacListObj][_AugIndex];
				if(_Aug != "Upgrade")
				ns.tprint(`${_Aug} ${ns.getAugmentationPrice(_Aug).toLocaleString("en-US")} ${ns.getAugmentationRepReq(_Aug)}xp`);				
			}
		}
	}

	for(let z=0;z<ns.args.length;z++) {
		if(ns.args[z] !== undefined) {
			if(ns.args[z] == 'autoWork' || ns.args[z] == 'autowork') {
				autoWork = true;
			}
		}
	}

	ns.tail();
	if(autoWork) {
		ns.run('crimeItUp.js',1,"auto",'l');
		ns.print("Starting to crime it up for initial money");
	}
	
	

	var inActiveRound = false;
	for(var AugIndex=0;AugIndex < AugsInOrder.length; AugIndex++) {
	let faction = Object.keys(AugsInOrder[AugIndex])[0];
	let inTempRound = false;
	let Augs = AugsInOrder[AugIndex][faction];
		await checkFactionMemberShipAndJoin(ns,faction);
		let roundTotalCost = 0;
			for(var __aug = 0; __aug < Augs.length; __aug++) {await ns.sleep(50);
				ns.print(`Round ${AugIndex}: \t${Augs[__aug]} \t$${ns.getAugmentationPrice(Augs[__aug]).toLocaleString('en-US')} \tRepXP: ${ns.getAugmentationRepReq(Augs[__aug])}`);
				roundTotalCost+=(ns.getAugmentationPrice(Augs[__aug])*(__aug+1));
			}
			
			ns.print(`Total cost for Augs in round ${AugIndex} is $${roundTotalCost.toLocaleString('en-US')}`);
				for(var aug = 0; aug < Augs.length; ++aug) {await ns.sleep(10);
					let currentAug = Augs[aug];
					if(currentAug == "Upgrade") {
						let uLoops = upgradesPerJob;
						if(AugIndex == AugsInOrder.length-1) {
							uLoops = 50;
						} 

						await runUpgradeLoop(ns,uLoops);
						inActiveRound = true;
					}

					if(!ns.getOwnedAugmentations(true).includes(currentAug)) {
						inActiveRound = true;
						ns.stopAction();
						ns.print("[Faction|| "+faction+" [Aug|| "+currentAug+ " Requires $"+ns.getAugmentationPrice(currentAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(currentAug).toLocaleString("en-US")+" Rep");
			
						let repNeeded = ns.getAugmentationRepReq(currentAug);
						while((!ns.gang.inGang() || faction != ns.gang.getGangInformation().faction) && ns.getFactionRep(faction) < repNeeded) {
							if(inTempRound) {
								break;
							}
							if(autoWork) {
								ns.print("Working for rep. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining rep needed: " + (ns.getAugmentationRepReq(currentAug) - ns.getFactionRep(faction)).toLocaleString("en-US"));
								ns.workForFaction(faction, workToDo);
							}
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
								if(inTempRound) {
									break;
								}
								if(autoWork) {
									ns.print("Criming for money. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining needed $"+(ns.getAugmentationPrice(currentAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US"));								
									ns.stopAction();
									if((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) < ns.getScriptRam("crimeItUp.js")) {
										await ns.scriptKill("hackit.js","home");
									}
									if(!ns.scriptRunning('crimeItUp.js','home')) {
										await ns.run('crimeItUp.js',1,"auto","s");
									}
								}
							}
							await ns.sleep(30000);
						}		
					}
				}
				if(inActiveRound && !inTempRound && AugIndex != 0) {
					ns.print("Entering Upgrade Loop at end of Aug Level "+AugIndex);
					await runUpgradeLoop(ns,2);
					if(AugsInOrder[AugIndex+1] !== undefined && AugsInOrder[AugIndex+1] !== null){
						let faction = Object.keys(AugsInOrder[AugIndex+1])[0];
						if(faction !== null && faction !== undefined) {
							let Augs = AugsInOrder[AugIndex][faction];
							if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(Augs[0])) {
								ns.print("Can afford Augmentations from next round; continueing into next round...");
								continue;
							}
						}
					}
					break;
				} else if(inTempRound) {
					ns.print("Can't afford Augmentations from next round; ending.");
					break;
				}


	}	
	
	
	if(ns.heart.break()<35000) {
		ns.print("Installing Augmentations");	
		ns.enableLog('sleep');
		ns.installAugmentations('init.js');
	} else {
		ns.print("Riding out this reboot for Gang creation");
		while(!ns.gang.inGang()) {
			await ns.sleep('60000') 
			ns.print(`Karma ${ns.heart.break()}`);
		}
	}
	ns.enableLog('sleep');
}	

async function runUpgradeLoop(ns, upgradesToGet) {
	let gradeUpAug = "NeuroFlux Governor";
	let workToDo = "hacking contracts";
	let targetFaction = 'CyberSec';
	let targetFactionRep = 1;
	let playerFactions = ns.getPlayer().factions;
	if(ns.gang.inGang()) {
		for(let f in playerFactions) {
			if(ns.getFactionRep(playerFactions[f]) > targetFactionRep && (!ns.gang.inGang() || playerFactions[f] != ns.gang.getGangInformation().faction)) {
				targetFactionRep = ns.getFactionRep(playerFactions[f]);
				targetFaction = playerFactions[f];
			}
		}
	}
	for(let countit = 1;countit <= upgradesToGet;countit++) {
		ns.stopAction();
		let onToNext = false;
		ns.print("GradeUp Aug "+gradeUpAug+" "+countit+ " Requires $"+ns.getAugmentationPrice(gradeUpAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(gradeUpAug)+" Rep");
		let repNeeded = ns.getAugmentationRepReq(gradeUpAug);
		while(ns.getFactionRep(targetFaction) < repNeeded) {
			let repRemaining = 0;
			if(ns.getFactionRep(targetFaction) != undefined) {
				repRemaining = ns.getFactionRep(targetFaction);
			}
			if(autoWork) {
				ns.print("Working for rep. Remaining rep needed: " + (ns.getAugmentationRepReq(gradeUpAug) - repRemaining).toLocaleString("en-US") + " with "+targetFaction);
				ns.workForFaction(targetFaction, workToDo);
			} else {
				ns.print("Waiting for rep. Remaining rep needed: " + (ns.getAugmentationRepReq(gradeUpAug) - repRemaining).toLocaleString("en-US") + " with "+targetFaction);
			}
    		await ns.sleep(60000);
		}
		do {			
			if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(gradeUpAug)) {
				let succ = ns.purchaseAugmentation(targetFaction, gradeUpAug);
				if(succ) {
					ns.print("Purchased Aug: ".gradeUpAug);
					onToNext = true;
				}
			}	else {
					if(autoWork) {
						ns.print("Criming for money. Remaining needed $"+(ns.getAugmentationPrice(gradeUpAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US") + " with "+targetFaction);
						if(!ns.isBusy()) {
							ns.stopAction();
							if((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) < ns.getScriptRam("crimeItUp.js")) {
								await ns.scriptKill("hackit.js","home");
							}
							if(!ns.scriptRunning('crimeItUp.js','home')) {
								await ns.run('crimeItUp.js',1,"auto","l");
							}
						}
					} else {
						ns.print("Waiting for money to upgrade "+gradeUpAug+". Remaining needed $"+(ns.getAugmentationPrice(gradeUpAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US") + " with "+targetFaction);
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
			ns.run('crimeItUp.js',1,"auto",'l');
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
				await ns.sleep(10000);
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
				if(ns.getPlayer().city == toJoinFaction[faction] || ns.getServerMoneyAvailable("home") >= 200000) {
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