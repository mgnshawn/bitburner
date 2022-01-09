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
	let initialFaction = {'CSEC':"CyberSec",'New Tokyo':"Tian Di Hui","Aevum":"Aevum","Sector-12":"Sector-12","Aevum":"The Syndicate"};
	let workToDo = "hacking contracts";
	
	let Augs = {'CyberSec':[["Synaptic Enhancement Implant","Neurotrainer I"],
				["BitWire"]]};
				//["Cranial Signal Processors - Gen I","Cranial Signal Processors - Gen II", 'Upgrade']]};
		Augs['Tian Di Hui'] =[['Social Negotiation Assistant (S.N.A)',  'ADR-V1 Pheromone Gene']]; //'Neuroreceptor Management Implant'
		Augs['Aevum'] = [['PCMatrix']];
		Augs['Sector-12'] = [['Neuralstimulator']];
		Augs['The Syndicate'] = [["The Shadow's Simulacrum","Power Recirculation Core"]];


	ns.tail();
	//ns.run('crimeItUp.js',1,"auto",'l');
	ns.print("Starting to crime it up for initial money");
	finishFacLevel:
	for(let joinList = 0; joinList < Object.keys(initialFaction).length; joinList++) {
		if(Object.keys(initialFaction)[joinList] == 'CSEC') {
			while(!ns.getServer(Object.keys(initialFaction)[joinList]).backdoorInstalled) {		
				ns.print("Waiting to install backdoor on CSEC");
				if(ns.getServer(Object.keys(initialFaction)[joinList])["hasAdminRights"]) {							
					let parent = findCSEC(ns);
					ns.connect(parent);
					await ns.sleep(500);
					ns.connect(Object.keys(initialFaction)[joinList]);
					await ns.sleep(100);
					let succ = await ns.installBackdoor();
					if(succ) {
						ns.print("Installing backdoor on "+Object.keys(initialFaction)[joinList]);
						ns.connect(parent);
						await ns.sleep(1000);
						ns.connect('home');
					}
				}
				await ns.sleep(60000);
			} 
			while(!ns.getPlayer().factions.includes(initialFaction[Object.keys(initialFaction)[joinList]])) {
				ns.print("Waiting to join "+initialFaction[Object.keys(initialFaction)[joinList]]);
				if(ns.checkFactionInvitations().includes(initialFaction[Object.keys(initialFaction)[joinList]])) {
					let succ = ns.joinFaction(initialFaction[Object.keys(initialFaction)[joinList]]);
					if(succ) {
						ns.print("   ...Joined "+initialFaction[Object.keys(initialFaction)[joinList]]);
					}
				}
				await ns.sleep(5000);
			}
		} else if (['New Tokyo','Aevum','Sector-12'].includes(Object.keys(initialFaction)[joinList])) {
			while(!ns.getPlayer().factions.includes(initialFaction[Object.keys(initialFaction)[joinList]])) {
				if(ns.getPlayer().city == Object.keys(initialFaction)[joinList] || ns.getServerMoneyAvailable("home") >= 200000) {
					if(ns.getPlayer().city != Object.keys(initialFaction)[joinList]) {
						ns.travelToCity(Object.keys(initialFaction)[joinList]);
					}
					await ns.sleep(10000);
					if(ns.checkFactionInvitations().includes(initialFaction[Object.keys(initialFaction)[joinList]])) {
						let succ = ns.joinFaction(initialFaction[Object.keys(initialFaction)[joinList]]);
						if(succ) {
							ns.print("   ...Joined "+initialFaction[Object.keys(initialFaction)[joinList]]);
						}
					} else {
						ns.print("waiting for invitation to "+initialFaction[Object.keys(initialFaction)[joinList]]);
					}
				
				} else {
					ns.print("waiting for enough money to travel to "+Object.keys(initialFaction)[joinList]);
				}
				await ns.sleep(5000);
			}
		}

		let inActiveRound = false;
		let activeRound = 0;
	
	let faction = joinList;
		//for(let faction = 0;faction < Object.keys(Augs).length; faction++) {
			for(let round = 0;round < Augs[Object.keys(Augs)[faction]].length; round++) {		
				for(let aug = 0; aug < Augs[Object.keys(Augs)[faction]][round].length; aug++) {
					if(Augs[Object.keys(Augs)[faction]][round][aug] == "Upgrade") {
						await runUpgradeLoop(ns);
						inActiveRound = true;
					} else {
					if(!ns.getOwnedAugmentations(true).includes(Augs[Object.keys(Augs)[faction]][round][aug])) {
						inActiveRound = true;
						ns.stopAction();
						activeRound = round;
						ns.print("[Faction|| "+Object.keys(Augs)[faction]+" [Round|| "+round+" [Aug|| "+Augs[Object.keys(Augs)[faction]][round][aug]+ " Requires $"+ns.getAugmentationPrice(Augs[Object.keys(Augs)[faction]][round][aug]).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(Augs[Object.keys(Augs)[faction]][round][aug]).toLocaleString("en-US")+" Rep");
			
						let repNeeded = ns.getAugmentationRepReq(Augs[Object.keys(Augs)[faction]][round][aug]);
						while(ns.getFactionRep(Object.keys(Augs)[faction]) < repNeeded) {
							ns.print("Working for rep. "+"[Faction|| "+Object.keys(Augs)[faction]+" [Round|| "+round+" [Aug|| "+Augs[Object.keys(Augs)[faction]][round][aug]+ " Remaining rep needed: " + (ns.getAugmentationRepReq(Augs[Object.keys(Augs)[faction]][round][aug]) - ns.getFactionRep(Object.keys(Augs)[faction])).toLocaleString("en-US"));
							ns.workForFaction(Object.keys(Augs)[faction], workToDo);
    						await ns.sleep(60000);
						}
						while (!ns.getOwnedAugmentations(true).includes(Augs[Object.keys(Augs)[faction]][round][aug])) {
							if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(Augs[Object.keys(Augs)[faction]][round][aug])) {
								ns.print("Purchasing "+Augs[Object.keys(Augs)[faction]][round][aug]+" from "+Object.keys(Augs)[faction]);
								let succ = ns.purchaseAugmentation(Object.keys(Augs)[faction], Augs[Object.keys(Augs)[faction]][round][aug]);
								if(succ) {
									ns.print("Purchased Aug: "+Augs[Object.keys(Augs)[faction]][round][aug]);
								}
							} else {
								ns.print("Criming for money. "+"[Faction|| "+Object.keys(Augs)[faction]+" [Round|| "+round+" [Aug|| "+Augs[Object.keys(Augs)[faction]][round][aug]+ " Remaining needed $"+(ns.getAugmentationPrice(Augs[Object.keys(Augs)[faction]][round][aug]) - ns.getServerMoneyAvailable('home')).toLocaleString("en-US"));								
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
					break finishFacLevel;
				}
			}
		//}
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

async function runUpgradeLoop(ns) {
	let gradeUpAug = "NeuroFlux Governor";
	let workToDo = "hacking contracts";
	for(let countit = 1;countit <= (activeRound+2);countit++) {
		ns.stopAction();
		let onToNext = false;
		ns.print("GradeUp Aug "+gradeUpAug+" "+countit+ " Requires $"+ns.getAugmentationPrice(gradeUpAug).toLocaleString("en-US")+" and "+ns.getAugmentationRepReq(gradeUpAug)+" Rep");
		let repNeeded = ns.getAugmentationRepReq(gradeUpAug);
		while(ns.getFactionRep(initialFaction[Object.keys(initialFaction)[0]]) < repNeeded) {
			ns.print("Working for rep. Remaining rep needed: " + (ns.getAugmentationRepReq(gradeUpAug) - ns.getFactionRep(initialFaction[Object.keys(initialFaction)[0]])).toLocaleString("en-US"));
			ns.workForFaction(initialFaction[Object.keys(initialFaction)[0]], workToDo);
    		await ns.sleep(60000);
		}
		do {			
			if(ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(gradeUpAug)) {
				let succ = ns.purchaseAugmentation(initialFaction[Object.keys(initialFaction)[0]], gradeUpAug);
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
