import {drawList1, drawStatus1, drawLCol, drawDoing, clearDoingLine, clearList1} from '/terminal.js';
import {money,travelToServer,travelBackHome} from '/helpers.js';
var AugsInOrder = [];
	
	
	var toJoinFaction = {'CyberSec':'CSEC','The Black Hand':'I.I.I.I','BitRunners':'run4theh111z','New Tokyo':'New Tokyo','Tian Di Hui':'New Tokyo', 'Aevum':'Aevum', 'Sector-12':'Sector-12','Tetrads':'New Tokyo','Slum Snakes':'Aevum','Daedalus':'New Tokyo'};
	var autoWork = false;
	var upgradesPerJob = 3;
	var gangName = "";
/* NeuroFlux Governor
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
	if(ns.gang.inGang()) {
		gangName = ns.gang.getGangInformation().faction;
	}
	AugsInOrder =[{'CyberSec':["Synaptic Enhancement Implant", "BitWire", "Neurotrainer I"]}];	
	AugsInOrder.push({'Tian Di Hui':['Social Negotiation Assistant (S.N.A)',  'ADR-V1 Pheromone Gene']});
	AugsInOrder.push({'CyberSec':['Cranial Signal Processors - Gen I','Cranial Signal Processors - Gen II']});			
	if(ns.getServerMoneyAvailable('home') < 10000000000 && ns.heart.break() > -10000 && ns.heart.break() < -4000 ) {
		let aa = [];
		for(let k = 1; k <= Math.ceil(ns.heart.break()/-10000); k++) {
			aa.push('NeuroFlux Governor');
	
		}
		AugsInOrder.push({'CyberSec':aa});
	
	}	
	AugsInOrder.push({'Tetrads':["Power Recirculation Core","NeuroFlux Governor","NeuroFlux Governor"]});
	AugsInOrder.push({'New Tokyo':["Neuralstimulator","DataJack","NeuroFlux Governor"]});
	AugsInOrder.push({'The Black Hand':["Embedded Netburner Module","Artificial Synaptic Potentiation"]});
	AugsInOrder.push({'BitRunners':['Embedded Netburner Module','Neurotrainer II']});
	if(ns.gang.inGang()) 
	{
		let temp1 = {};
		temp1[gangName] = ["The Shadow's Simulacrum","Power Recirculation Core",'Neurotrainer II'];
		AugsInOrder.push(temp1);
		let temp2 = {};
		temp2[gangName] =['The Black Hand','Neuregen Gene Modification','CRTX42-AA Gene Modification','Neurotrainer III','Artificial Synaptic Potentiation'];
		AugsInOrder.push(temp2);
		}
	if(!ns.getPlayer().factions.includes('New Tokyo'))
	{	AugsInOrder.push({'Aevum':['PCMatrix']});
		}
	AugsInOrder.push({'BitRunners':['Cranial Signal Processors - Gen III']});
	AugsInOrder.push({'BitRunners':['Enhanced Myelin Sheathing','Cranial Signal Processors - Gen IV']});
	AugsInOrder.push({'The Black Hand':["Enhanced Myelin Sheathing","Cranial Signal Processors - Gen III","The Black Hand"]});
	
	if(ns.gang.inGang()) 
	{
		let temp3 = {};
		temp3[gangName] = ['Cranial Signal Processors - Gen IV','Cranial Signal Processors - Gen V','Neuralstimulator','Neural Accelerator','DataJack','Neural-Retention Enhancement'];
		AugsInOrder.push(temp3);
		let temp4 = {};
		temp4[gangName] = ['OmniTek InfoLoad','SPTN-97 Gene Modification','Neuronal Densification','Artificial Bio-neural Network Implant','Enhanced Myelin Sheathing'];
		AugsInOrder.push(temp4);
		}
	else
	{
		AugsInOrder.push({'BitRunners':['Neural Accelerator','Artificial Bio-neural Network Implant']});
		AugsInOrder.push({'BitRunners':['BitRunners Neurolink']});
		}
	AugsInOrder.push({'CyberSec':['Upgrade']});
	if(ns.gang.inGang()) 
	{
		let temp5 = {};
		temp5[gangName] = ['PC Direct-Neural Interface NeuroNet Injector','PC Direct-Neural Interface Optimization Submodule'];
		AugsInOrder.push(temp5);
		}
	AugsInOrder.push({'Daedalus':['The Red Pill']});
	
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
					ns.tprint(`Aug:: ${_Aug}\t${owned}\t $${ns.getAugmentationPrice(_Aug).toLocaleString("en-US")}\t${Math.round(ns.getAugmentationRepReq(_Aug))}xp`);
					drawList1(ns,`Aug:: ${_Aug}\t${owned}\t $${ns.getAugmentationPrice(_Aug).toLocaleString("en-US")}\t${Math.round(ns.getAugmentationRepReq(_Aug))}xp`);				
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

	var inActiveRound = false;
	for(var AugIndex=0;AugIndex < AugsInOrder.length; AugIndex++) {
	let faction = Object.keys(AugsInOrder[AugIndex])[0];
	if(faction == 'New Tokyo' && ns.getPlayer().factions.includes('Aevum'))
		continue;
	if(faction == 'Aevum' && ns.getPlayer().factions.includes('New York'))
		continue;
	let inTempRound = false;
	let Augs = AugsInOrder[AugIndex][faction];
	if(faction == 'Tetrads') {
		workToDo = 'security work';
	} else {
		workToDo = 'hacking contracts';
	}
		await checkFactionMemberShipAndJoin(ns,faction);
		await updateAugListDisplay(ns,Augs, AugIndex, faction);
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
						drawStatus1(ns,"[Faction|| "+faction+" [Aug|| "+currentAug+ " Requires $"+ns.getAugmentationPrice(currentAug).toLocaleString("en-US")+" and "+Math.round(ns.getAugmentationRepReq(currentAug)).toLocaleString("en-US")+" Rep");
			
						let repNeeded = ns.getAugmentationRepReq(currentAug);
						while((!ns.gang.inGang() || faction != ns.gang.getGangInformation().faction) && ns.getFactionRep(faction) < repNeeded) {
							if(inTempRound) {
								break;
							}
							if(autoWork) {
								drawStatus1(ns,"Working for rep. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining rep needed: " + Math.round(ns.getAugmentationRepReq(currentAug) - ns.getFactionRep(faction)).toLocaleString("en-US"));
							
								ns.workForFaction(faction, workToDo);
								drawDoing(`Working for rep w/${faction}`);
							} else {
								drawStatus1(ns,"Waiting for rep. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining rep needed: " + Math.round(ns.getAugmentationRepReq(currentAug) - ns.getFactionRep(faction)).toLocaleString("en-US"));
							}
    						await ns.sleep(60 * 1000);
							clearDoingLine();
							await ns.sleep(5);
							
						}
						ns.stopAction();
						while (!ns.getOwnedAugmentations(true).includes(currentAug)) {
							if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(currentAug)) {
								
								let succ = ns.purchaseAugmentation(faction, currentAug);
								if(succ) {
									await clearList1(ns);
									await updateAugListDisplay(ns,Augs, AugIndex,faction);
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
				if(Augs[0] == "NeuroFlux Governor") {
					inActiveRound = true;
				}
				if(inActiveRound && !inTempRound && AugIndex != 0) {
					drawStatus1(ns,"Entering Upgrade Loop at end of Aug Level "+AugIndex);
					await runUpgradeLoop(ns,2);
					inTempRound = true;
					drawStatus1(ns,"Checking for remaining money before installing...");
					if(AugsInOrder[AugIndex+1] !== undefined && AugsInOrder[AugIndex+1] !== null){
						let faction = Object.keys(AugsInOrder[AugIndex+1])[0];
						if(faction !== null && faction !== undefined) {
							let Augs = AugsInOrder[AugIndex+1][faction];
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
async function updateAugListDisplay(ns, Augs, AugIndex,faction) {
		let roundTotalCost = 0;
			for(var __aug = 0; __aug < Augs.length; __aug++) {await ns.sleep(50);
				let owned = "";
				let augName = Augs[__aug];
				if(augName == "Upgrade") {
					augName = "NeuroFlux Governor";
				}
				if(ns.getOwnedAugmentations(true).includes(augName)) {
					owned = `  *owned*`;
				} else if(faction == 'Slum Snakes' && !ns.gang.inGang()) {
						owned = `  need gang`;
					} else {
						owned = `  `;
					}
				drawList1(ns,`Round ${AugIndex}:${owned}\t${augName} \t$${ns.getAugmentationPrice(augName).toLocaleString('en-US')} \tRepXP: ${Math.round(ns.getAugmentationRepReq(augName)).toLocaleString('en-US')}`);
				roundTotalCost+=(ns.getAugmentationPrice(augName)*(__aug+1));
			}
			
			drawList1(ns,`Total cost for Augs in round ${AugIndex} is $${money(roundTotalCost)}`);

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
		drawStatus1(ns,"GradeUp Aug "+gradeUpAug+" "+countit+ " Requires $"+ns.getAugmentationPrice(gradeUpAug).toLocaleString("en-US")+" and "+Math.round(ns.getAugmentationRepReq(gradeUpAug)).toLocaleString('en-US')+" Rep");
		let repNeeded = ns.getAugmentationRepReq(gradeUpAug);
		while(ns.getFactionRep(targetFaction) < repNeeded) {
			let repRemaining = 0;
			if(ns.getFactionRep(targetFaction) != undefined) {
				repRemaining = ns.getFactionRep(targetFaction);
			}
			if(autoWork) {
				drawStatus1(ns,"Working for rep. Remaining rep needed: " + Math.round(ns.getAugmentationRepReq(gradeUpAug) - repRemaining).toLocaleString("en-US") + " with "+targetFaction);
				ns.workForFaction(targetFaction, workToDo);
			} else {
				drawStatus1(ns,"Waiting for rep. Remaining rep needed: " + Math.round(ns.getAugmentationRepReq(gradeUpAug) - repRemaining).toLocaleString("en-US") + " with "+targetFaction);
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
	ns.print(`checking membership for ${faction}`);
	if(!ns.getPlayer().factions.includes(faction)) {
		ns.print(`not in ${faction}`);
		if(['CyberSec','The Black Hand','BitRunners'].includes(faction)) {
			ns.print(`join loop for ${faction}`);
			ns.run('crimeItUp.js',1,"auto",'l');
			while(!ns.getServer(toJoinFaction[faction]).backdoorInstalled) {		
				ns.print(drawStatus1(ns,`Waiting to install backdoor on ${faction}`));
				if(ns.getServer(toJoinFaction[faction])["hasAdminRights"]) {									
					ns.print(`traveling to ${toJoinFaction[faction]}`);		
					await travelToServer(ns,toJoinFaction[faction]);
					await ns.sleep(1000);
					ns.tprint(`location is ${ns.getCurrentServer()}`);
					await ns.sleep(1000);
					var succ = await ns.installBackdoor();
					await ns.sleep(1000);
					if(succ)  {
						drawStatus1(ns,"Installing backdoor on "+toJoinFaction[faction]);						
						await ns.sleep(1000);
					ns.print(`traveling back home via ${findServerPath(ns,toJoinFaction[faction])} `);		
						await travelBackHome(ns,parent);
					} else {
						ns.print('failed to install backdoor');
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
	} else { ns.print(`in ${faction}`);}
}