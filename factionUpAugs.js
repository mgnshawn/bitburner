import {drawList1, drawStatus1, drawLCol, drawDoing, clearDoingLine} from '/terminal.js';
var AugsInOrder = [];
	AugsInOrder =[{'CyberSec':["Synaptic Enhancement Implant", "BitWire", "Neurotrainer I"]}];
//	AugsInOrder.push({'CyberSec':['Upgrade','Upgrade']});
	AugsInOrder.push({'Tian Di Hui':['Social Negotiation Assistant (S.N.A)',  'ADR-V1 Pheromone Gene']});
	AugsInOrder.push({'CyberSec':['Cranial Signal Processors - Gen I','Cranial Signal Processors - Gen II']});			
	AugsInOrder.push({'Slum Snakes':["The Shadow's Simulacrum","Power Recirculation Core",'Neurotrainer II']});
	AugsInOrder.push({'Slum Snakes':['The Black Hand','Neuregen Gene Modification','CRTX42-AA Gene Modification','Neurotrainer III','Artificial Synaptic Potentiation']});
	AugsInOrder.push({'Aevum':['PCMatrix']});
	AugsInOrder.push({'Slum Snakes':['Cranial Signal Processors - Gen IV','Cranial Signal Processors - Gen V','Neuralstimulator','Neural Accelerator','DataJack','Neural-Retention Enhancement']});
	AugsInOrder.push({'Slum Snakes':['OmniTek InfoLoad','SPTN-97 Gene Modification','Neuronal Densification','Artificial Bio-neural Network Implant','Enhanced Myelin Sheathing']});
	AugsInOrder.push({'CyberSec':['Upgrade']});
	AugsInOrder.push({'Slum Snakes':['PC Direct-Neural Interface NeuroNet Injector','PC Direct-Neural Interface Optimization Submodule']});
	AugsInOrder.push({'Daedalus':['The Red Pill']});
	
	var toJoinFaction = {'CyberSec':'CSEC', 'Tian Di Hui':'New Tokyo', 'Aevum':'Aevum', 'Sector-12':'Sector-12','Slum Snakes':'Aevum','Daedalus':'New Toky'};
	var autoWork = false;
	var upgradesPerJob = 3;
/*
"The Shadow's Simulacrum",
	*/
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('disableLog');
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
	ns.disableLog('stopAction');
	ns.disableLog('connect');
	ns.disableLog('installBackdoor');
	ns.disableLog('run');
	ns.disableLog('travelToCity');
	ns.print("============================================ Beginning Faction Up ============================================");
	ns.tail();
	//await draw(ns,['this is a test','line two of the test'],"Doing xyz for pdq");

	
	let workToDo = "hacking contracts";
	for(let AugObjIndex in AugsInOrder) {
		for(let FacListObj in AugsInOrder[AugObjIndex]) {
			for(let _AugIndex in AugsInOrder[AugObjIndex][FacListObj]) {
				let _Aug = AugsInOrder[AugObjIndex][FacListObj][_AugIndex];
				if(_Aug != "Upgrade") {
					let owned = "";
					if(ns.getOwnedAugmentations(true).includes(_Aug)) {
						owned = "*owned*";
					} else if(FacListObj == 'Slum Snakes' && !ns.gang.inGang()) {
						owned = "need gang";
					}
					ns.tprint(`Aug:: ${_Aug}\t${owned}\t $${ns.getAugmentationPrice(_Aug).toLocaleString("en-US")}\t${ns.getAugmentationRepReq(_Aug)}xp`);
					drawList1(ns,`Aug:: ${_Aug}\t${owned}\t $${ns.getAugmentationPrice(_Aug).toLocaleString("en-US")}\t${ns.getAugmentationRepReq(_Aug)}xp`);				
				}
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
		drawStatus1(ns,"Starting to crime it up for initial money");
	}
	
	

	var inActiveRound = false;
	for(var AugIndex=0;AugIndex < AugsInOrder.length; AugIndex++) {
	let faction = Object.keys(AugsInOrder[AugIndex])[0];
	let inTempRound = false;
	let Augs = AugsInOrder[AugIndex][faction];
		await checkFactionMemberShipAndJoin(ns,faction);
		let roundTotalCost = 0;
			for(var __aug = 0; __aug < Augs.length; __aug++) {await ns.sleep(50);
				let owned = "";
				if(ns.getOwnedAugmentations(true).includes(Augs[__aug])) {
					owned = `  *owned*`;
				} else if(faction == 'Slum Snakes' && !ns.gang.inGang()) {
						owned = `  need gang`;
					} else {
						owned = `  `;
					}
				drawList1(ns,`Round ${AugIndex}:${owned}\t${Augs[__aug]} \t$${ns.getAugmentationPrice(Augs[__aug]).toLocaleString('en-US')} \tRepXP: ${ns.getAugmentationRepReq(Augs[__aug])}`);
				roundTotalCost+=(ns.getAugmentationPrice(Augs[__aug])*(__aug+1));
			}
			
			drawList1(ns,`Total cost for Augs in round ${AugIndex} is $${roundTotalCost.toLocaleString('en-US')}`);
				for(var aug = 0; aug < Augs.length; ++aug) {
					let currentAug = Augs[aug];
					if(currentAug == "Upgrade") {
						let uLoops = upgradesPerJob;
						if(AugIndex == AugsInOrder.length-1) {
							uLoops = 50;
						} 

						await runUpgradeLoop(ns,uLoops);
						inActiveRound = true;
						continue;
					}

					if(!ns.getOwnedAugmentations(true).includes(currentAug)) {
						inActiveRound = true;
						if(autoWork) {
							ns.stopAction();
						}
						drawStatus1(ns,"[Faction|| "+faction+" [Aug|| "+currentAug+ " Requires $"+ns.getAugmentationPrice(currentAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(currentAug).toLocaleString("en-US")+" Rep");
			
						let repNeeded = ns.getAugmentationRepReq(currentAug);
						while((!ns.gang.inGang() || faction != ns.gang.getGangInformation().faction) && ns.getFactionRep(faction) < repNeeded) {
							if(inTempRound) {
								break;
							}
							if(autoWork) {
								drawStatus1(ns,"Working for rep. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining rep needed: " + (ns.getAugmentationRepReq(currentAug) - ns.getFactionRep(faction)).toLocaleString("en-US"));
							
								ns.workForFaction(faction, workToDo);
							} else {
								drawStatus1(ns,"Waiting for rep. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining rep needed: " + (ns.getAugmentationRepReq(currentAug) - ns.getFactionRep(faction)).toLocaleString("en-US"));
							}
    						await ns.sleep(60 * 1000);
							
						}
						ns.stopAction();
						while (!ns.getOwnedAugmentations(true).includes(currentAug)) {
							if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(currentAug)) {
								
								let succ = ns.purchaseAugmentation(faction, currentAug);
								if(succ) {
									drawStatus1(ns,"Purchasing "+currentAug+" from "+faction);
								}
							} else {
								if(inTempRound) {
									break;
								}
								if(autoWork && !ns.isBusy()) {
									drawStatus1(ns,"Criming for money. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining needed $"+(ns.getAugmentationPrice(currentAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US"));								
									if((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) < ns.getScriptRam("crimeItUp.js")) {
										await ns.scriptKill("hackit.js","home");
									}
									if(!ns.scriptRunning('crimeItUp.js','home')) {
										await ns.run('crimeItUp.js',1,"auto","s");
									}
								} else {
									drawStatus1(ns,"Waiting for money. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining needed $"+(ns.getAugmentationPrice(currentAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US"));								
								}
							}
							await ns.sleep(90 * 1000);
						}		
					}
				}
				if(inActiveRound && !inTempRound && AugIndex != 0) {
					drawStatus1(ns,"Entering Upgrade Loop at end of Aug Level "+AugIndex);
					await runUpgradeLoop(ns,2);
					if(AugsInOrder[AugIndex+1] !== undefined && AugsInOrder[AugIndex+1] !== null){
						let faction = Object.keys(AugsInOrder[AugIndex+1])[0];
						if(faction !== null && faction !== undefined) {
							let Augs = AugsInOrder[AugIndex][faction];
							if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(Augs[0])) {
								drawStatus1(ns,"Can afford Augmentations from next round; continueing into next round...");
								continue;
							}
						}
					}
					break;
				} else if(inTempRound) {
					drawStatus1(ns,"Can't afford Augmentations from next round; ending.");
					break;
				}


	}	
	
	
	if(ns.heart.break()<35000) {
		drawStatus1(ns,"Installing Augmentations");	
		ns.installAugmentations('init.js');
	} else {
		drawStatus1(ns,"Riding out this reboot for Gang creation");
		while(!ns.gang.inGang()) {
			await ns.sleep('60000') 
			drawStatus1(ns,`Karma ${ns.heart.break()}`);
		}
	}
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
		drawStatus1(ns,"GradeUp Aug "+gradeUpAug+" "+countit+ " Requires $"+ns.getAugmentationPrice(gradeUpAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(gradeUpAug)+" Rep");
		let repNeeded = ns.getAugmentationRepReq(gradeUpAug);
		while(ns.getFactionRep(targetFaction) < repNeeded) {
			let repRemaining = 0;
			if(ns.getFactionRep(targetFaction) != undefined) {
				repRemaining = ns.getFactionRep(targetFaction);
			}
			if(autoWork) {
				drawStatus1(ns,"Working for rep. Remaining rep needed: " + (ns.getAugmentationRepReq(gradeUpAug) - repRemaining).toLocaleString("en-US") + " with "+targetFaction);
				ns.workForFaction(targetFaction, workToDo);
			} else {
				drawStatus1(ns,"Waiting for rep. Remaining rep needed: " + (ns.getAugmentationRepReq(gradeUpAug) - repRemaining).toLocaleString("en-US") + " with "+targetFaction);
			}
    		await ns.sleep(60000);
		}
		do {			
			if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(gradeUpAug)) {
				let succ = ns.purchaseAugmentation(targetFaction, gradeUpAug);
				if(succ) {
					drawStatus1(ns,"Purchased Aug: ".gradeUpAug);
					onToNext = true;
				}
			}	else {
					if(autoWork && !ns.isBusy()) {
						drawStatus1(ns,"Criming for money. Remaining needed $"+(ns.getAugmentationPrice(gradeUpAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US") + " with "+targetFaction);
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
						drawStatus1(ns,"Waiting for money to upgrade "+gradeUpAug+". Remaining needed $"+(ns.getAugmentationPrice(gradeUpAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US") + " with "+targetFaction);
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
				drawStatus1(ns,"Waiting to install backdoor on CSEC");
				if(ns.getServer(toJoinFaction[faction])["hasAdminRights"]) {							
					var parent = findCSEC(ns);
					ns.connect(parent);
					await ns.sleep(500);
					ns.connect(toJoinFaction[faction]);
					await ns.sleep(100);
					var succ = await ns.installBackdoor();
					if(succ) {
						drawStatus1(ns,"Installing backdoor on "+toJoinFaction[faction]);
						ns.connect(parent);
						await ns.sleep(1000);
						ns.connect('home');
					}
				}
				await ns.sleep(10000);
			} 
			while(!ns.getPlayer().factions.includes(faction)) {
				drawStatus1(ns,"Waiting to join "+faction);
				if(ns.checkFactionInvitations().includes(faction)) {
					var succ = ns.joinFaction(faction);
					if(succ) {
						drawStatus1(ns,"   ...Joined "+faction);
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
							drawStatus1(ns,"   ...Joined "+faction);
						}
					} else {
						drawStatus1(ns,"waiting for invitation to "+faction);
					}
				
				} else {
					drawStatus1(ns,"waiting for enough money to travel to "+toJoinFaction[faction]);
				}
				await ns.sleep(5000);
			}
		}
	}
}