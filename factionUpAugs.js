var AugsInOrder = [];
	AugsInOrder =[{'CyberSec':["Synaptic Enhancement Implant", "BitWire", "Neurotrainer I"]}];
	AugsInOrder.push({'CyberSec':['Upgrade','Upgrade']});
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

var termHeight = 28;
var termWidth = 140;
var statusLines = 16;
var stateLines = 3;
var list = [];
var state = [];

function drawList(ns,newLine) {
	let t = new Date();
		let hours = ('0' + t.getHours()).slice(-2);
		let minutes = ('0' + t.getMinutes()).slice(-2);
		let seconds = ('0' + t.getSeconds()).slice(-2);
	if(list.length >= statusLines) {
		list.shift();
		list.push([`${hours}:${minutes}:${seconds}`,newLine]);
		}else {
			list.push([`${hours}:${minutes}:${seconds}`,newLine]);
		}
	 draw(ns);
}
function drawStatus(ns,newLine) {
	let t = new Date();
		let hours = ('0' + t.getHours()).slice(-2);
		let minutes = ('0' + t.getMinutes()).slice(-2);
		let seconds = ('0' + t.getSeconds()).slice(-2);
	if(state.length >= stateLines) {
		state.pop();
		state.unshift([`${hours}:${minutes}:${seconds}`,newLine]);
		}else {
			state.unshift([`${hours}:${minutes}:${seconds}`,newLine]);
		}
		
	 draw(ns);
}
 function draw(ns) {
		ns.clearLog();
	
		let listLines = [];
		let stateListLines = [];
		for(let _z = 1;_z<=statusLines;_z++) {
			listLines.push(_z);
		}
		for(let _x=termHeight-1; _x > 0; _x--) {
			if(_x <=termHeight-2 && _x >= termHeight-stateLines-1) {
				stateListLines.push(_x);
			} else {
				stateListLines.push(0);
			}
		}


		for(let y= 0;y<termHeight;y++) {	
			let CurrLine = "";		
			if(y in listLines) {
				if(list[y-1] !== undefined && list[y-1][1])
				list[y-1][1] = list[y-1][1].toString().replace(/\t/g, `    `);
			}
			if(y in stateListLines) {
				if(state[y-1] !== undefined && state[y-1][1] !== undefined)
				state[y-1][1] = state[y-1][1].toString().replace(/\t/g, `    `);
			}
			for(let x =0; x < termWidth;x++) {
				if(y == 0||y == (termHeight-1) || y == (termHeight-2-stateLines)) { // Top or Bottom border
					CurrLine+=`=`;
				}				
				 else {
					if(x == 0 || x == (termWidth-1)) { // Left and Right border
						CurrLine+=`|`;
					}else if (x == 1) {
						CurrLine +=` `;
					} else if (x == 10) {
						CurrLine += ` `;
					}
					
					else {
						if(y in listLines) {					
							if(list[y-1] !== undefined)
							{
								if(x >= 2 && x < 10) { // left padding
									CurrLine += list[y-1][0][x-2];
								}else 
								if(list[y-1][1][x-11] !== undefined) {
									CurrLine += list[y-1][1][x-11];
								} else {
									CurrLine += ` `;
								}
							}
						 } else
						if( y in stateListLines) {
							if(state[termHeight-2-y] !== undefined) {

							if(x >= 2 && x < 10 && state[termHeight-2-y][0][x-2] !== undefined) {								
									CurrLine += state[termHeight-2-y][0][x-2];
							} else if(x >=10 &&state[termHeight-2-y][1][x-11] != undefined) {
									CurrLine += state[termHeight-2-y][1][x-11];

							} else {
								CurrLine += ` `;
							}
						} else {
								CurrLine += ` `;
						}
					}
				}				
			
			}
			}
			ns.print(CurrLine);

		
		}
	}
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
					}
					ns.tprint(`Aug:: ${_Aug}\t${owned}\t $${ns.getAugmentationPrice(_Aug).toLocaleString("en-US")}\t${ns.getAugmentationRepReq(_Aug)}xp`);
					drawList(ns,`Aug:: ${_Aug}\t${owned}\t $${ns.getAugmentationPrice(_Aug).toLocaleString("en-US")}\t${ns.getAugmentationRepReq(_Aug)}xp`);				
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
		drawStatus(ns,"Starting to crime it up for initial money");
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
					owned = "*owned*";
				}
				drawList(ns,`Round ${AugIndex}:\t${owned}\t${Augs[__aug]} \t$${ns.getAugmentationPrice(Augs[__aug]).toLocaleString('en-US')} \tRepXP: ${ns.getAugmentationRepReq(Augs[__aug])}`);
				roundTotalCost+=(ns.getAugmentationPrice(Augs[__aug])*(__aug+1));
			}
			
			drawList(ns,`Total cost for Augs in round ${AugIndex} is $${roundTotalCost.toLocaleString('en-US')}`);
				for(var aug = 0; aug < Augs.length; ++aug) {
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
						if(autoWork) {
							ns.stopAction();
						}
						drawStatus(ns,"[Faction|| "+faction+" [Aug|| "+currentAug+ " Requires $"+ns.getAugmentationPrice(currentAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(currentAug).toLocaleString("en-US")+" Rep");
			
						let repNeeded = ns.getAugmentationRepReq(currentAug);
						while((!ns.gang.inGang() || faction != ns.gang.getGangInformation().faction) && ns.getFactionRep(faction) < repNeeded) {
							if(inTempRound) {
								break;
							}
							if(autoWork) {
								drawStatus(ns,"Working for rep. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining rep needed: " + (ns.getAugmentationRepReq(currentAug) - ns.getFactionRep(faction)).toLocaleString("en-US"));
								ns.workForFaction(faction, workToDo);
							} else {
								drawStatus(ns,"Waiting for rep. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining rep needed: " + (ns.getAugmentationRepReq(currentAug) - ns.getFactionRep(faction)).toLocaleString("en-US"));
							}
    						await ns.sleep(60 * 1000);
						}
						ns.stopAction();
						while (!ns.getOwnedAugmentations(true).includes(currentAug)) {
							if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(currentAug)) {
								
								let succ = ns.purchaseAugmentation(faction, currentAug);
								if(succ) {
									drawStatus(ns,"Purchasing "+currentAug+" from "+faction);
								}
							} else {
								if(inTempRound) {
									break;
								}
								if(autoWork && !ns.isBusy()) {
									drawStatus(ns,"Criming for money. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining needed $"+(ns.getAugmentationPrice(currentAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US"));								
									if((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) < ns.getScriptRam("crimeItUp.js")) {
										await ns.scriptKill("hackit.js","home");
									}
									if(!ns.scriptRunning('crimeItUp.js','home')) {
										await ns.run('crimeItUp.js',1,"auto","s");
									}
								} else {
									drawStatus(ns,"Waiting for money. "+"[Faction|| "+faction+" [Aug|| "+currentAug+ " Remaining needed $"+(ns.getAugmentationPrice(currentAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US"));								
								}
							}
							await ns.sleep(90 * 1000);
						}		
					}
				}
				if(inActiveRound && !inTempRound && AugIndex != 0) {
					drawStatus(ns,"Entering Upgrade Loop at end of Aug Level "+AugIndex);
					await runUpgradeLoop(ns,2);
					if(AugsInOrder[AugIndex+1] !== undefined && AugsInOrder[AugIndex+1] !== null){
						let faction = Object.keys(AugsInOrder[AugIndex+1])[0];
						if(faction !== null && faction !== undefined) {
							let Augs = AugsInOrder[AugIndex][faction];
							if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(Augs[0])) {
								drawStatus(ns,"Can afford Augmentations from next round; continueing into next round...");
								continue;
							}
						}
					}
					break;
				} else if(inTempRound) {
					drawStatus(ns,"Can't afford Augmentations from next round; ending.");
					break;
				}


	}	
	
	
	if(ns.heart.break()<35000) {
		drawStatus(ns,"Installing Augmentations");	
		ns.installAugmentations('init.js');
	} else {
		drawStatus(ns,"Riding out this reboot for Gang creation");
		while(!ns.gang.inGang()) {
			await ns.sleep('60000') 
			drawStatus(ns,`Karma ${ns.heart.break()}`);
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
		drawStatus(ns,"GradeUp Aug "+gradeUpAug+" "+countit+ " Requires $"+ns.getAugmentationPrice(gradeUpAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(gradeUpAug)+" Rep");
		let repNeeded = ns.getAugmentationRepReq(gradeUpAug);
		while(ns.getFactionRep(targetFaction) < repNeeded) {
			let repRemaining = 0;
			if(ns.getFactionRep(targetFaction) != undefined) {
				repRemaining = ns.getFactionRep(targetFaction);
			}
			if(autoWork) {
				drawStatus(ns,"Working for rep. Remaining rep needed: " + (ns.getAugmentationRepReq(gradeUpAug) - repRemaining).toLocaleString("en-US") + " with "+targetFaction);
				ns.workForFaction(targetFaction, workToDo);
			} else {
				drawStatus(ns,"Waiting for rep. Remaining rep needed: " + (ns.getAugmentationRepReq(gradeUpAug) - repRemaining).toLocaleString("en-US") + " with "+targetFaction);
			}
    		await ns.sleep(60000);
		}
		do {			
			if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(gradeUpAug)) {
				let succ = ns.purchaseAugmentation(targetFaction, gradeUpAug);
				if(succ) {
					drawStatus(ns,"Purchased Aug: ".gradeUpAug);
					onToNext = true;
				}
			}	else {
					if(autoWork && !ns.isBusy()) {
						drawStatus(ns,"Criming for money. Remaining needed $"+(ns.getAugmentationPrice(gradeUpAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US") + " with "+targetFaction);
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
						drawStatus(ns,"Waiting for money to upgrade "+gradeUpAug+". Remaining needed $"+(ns.getAugmentationPrice(gradeUpAug) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US") + " with "+targetFaction);
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
				drawStatus(ns,"Waiting to install backdoor on CSEC");
				if(ns.getServer(toJoinFaction[faction])["hasAdminRights"]) {							
					var parent = findCSEC(ns);
					ns.connect(parent);
					await ns.sleep(500);
					ns.connect(toJoinFaction[faction]);
					await ns.sleep(100);
					var succ = await ns.installBackdoor();
					if(succ) {
						drawStatus(ns,"Installing backdoor on "+toJoinFaction[faction]);
						ns.connect(parent);
						await ns.sleep(1000);
						ns.connect('home');
					}
				}
				await ns.sleep(10000);
			} 
			while(!ns.getPlayer().factions.includes(faction)) {
				drawStatus(ns,"Waiting to join "+faction);
				if(ns.checkFactionInvitations().includes(faction)) {
					var succ = ns.joinFaction(faction);
					if(succ) {
						drawStatus(ns,"   ...Joined "+faction);
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
							drawStatus(ns,"   ...Joined "+faction);
						}
					} else {
						drawStatus(ns,"waiting for invitation to "+faction);
					}
				
				} else {
					drawStatus(ns,"waiting for enough money to travel to "+toJoinFaction[faction]);
				}
				await ns.sleep(5000);
			}
		}
	}
}