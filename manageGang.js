import {getItem, setItem,getLockAndUpdate} from '/_helpers/ioHelpers.js';
/** @type import(".").NS */
var ns;
var gangSettings = { 'maxMembersAtWarfareBeforeWar': 2, 'moneyInBankToAscend': 100000000, 'trainCombatStrAscMult_multiplier':850 };
var repThreshold = 15; // When to switch to improving wanted level


const goToWarWhenChancesOver = 70
const maximumFullGangAtWar = 8; // Most members that can being doing Territory Warface
const minimumFullGangTerror = 3; // Minimum number of members doing Terrorism
const maxMembersToAscendDuringWar = 2;

var previousTerritoryHeld = 0;

var endGameFocus = "Reputation"; //options Reputation, Money\
var endGameFocusOptions = ['Reputation', 'Money'];

var timeToHoldOffOnAscentionAfterEquipping = 5 * 60 * 1000;
var costOfEquipmentToPauseAscention = 50000000;
var maxTimeBetweenAscention = 15 * 60 * 1000;
var timeCycle = 1 * 60;


var ascentionStatReqs = { 'strength': 1.15, 'dexterity': 1.3, 'agility': 1.3 };
var fullGangMembersInfo;
var verbose;
var ascentionEnabled;
var debugOnly;
var equipOnly;
var fullTeam;
var purchaseHackingAugs;
// If a gang member's string is under the number it selects the highest option
//var jumpLevels = {"Mug People":50,"Train Combat":100,"Strongarm Civilians":325,"Human Trafficking":500,"Terrorism":1500};
var jumpLevels = [["Train Combat", 90], ["Mug People", 130], ["Strongarm Civilians", 400], ["Terrorism", 550], ["Human Trafficking", 950], ["Terrorism", 100000000]];
var names = ['shawn', 'joe', 'mike', 'heather', 'irene', 'anna', 'tony', 'bobby', 'billy', 'lance', 'sarah', 'misty'];
var myGang = {};

/** @param {NS} ns **/
export async function main(_ns) {
	ns = _ns;
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
	
	var verbose = false;
	ascentionEnabled = true;
	debugOnly = false;
	equipOnly = false;
	fullTeam = false;
	purchaseHackingAugs = false;

	let tmpFullGangMembersInfo = getItem(ns,'fullGangMembersInfo');
	await ns.sleep(300);

	for (let z = 0; z < ns.args.length; z++) {
		if (ns.args[z] !== undefined) {
			if (ns.args[z] !== undefined && ['h', '-h', '?', '-?'].includes(ns.args[z])) {
				ns.tprint(`arguments (v) (debugonly)  (equiponly)  (endgamefocus:[money,reputation]`);
				ns.exit();
			}
			ns.tail();
			if (ns.args[z] == 'v') 
				verbose = true;
			}
			if (ns.args[z] == 'endgame' && ns.args[z + 1] !== undefined) {
				endGameFocus = ns.args[z + 1];
			}
			if (ns.args[z] == 'debugonly') {
				debugOnly = true;
			}
			if (ns.args[z] == 'equiponly') {
				equipOnly = true;
				debugOnly = true;
			}
			if (ns.args[z] == 'endgamefocus' && ns.args[z + 1] != undefined && endGameFocusOptions.includes(ns.args[z + 1].toLowerCase()[0].toUpperCase() + ns.args[z + 1].toLowerCase().slice(1))) {
				endGameFocus = ns.args[z + 1].toLowerCase()[0].toUpperCase + ns.args[z + 1].toLowerCase().slice(1);
				ns.print(`Setting EndGame Focus To: ${endGameFocus}`);
			}
			
			
			if (ns.args[z] == 'freshstart' || tmpFullGangMembersInfo == undefined) {
				fullGangMembersInfo = [];
				sessionStorage.removeItem('fullGangMembersInfo_Locked');
				sessionStorage.removeItem('fullGangMembersInfo');
				ns.gang.getMemberNames().forEach(m => {
					let tmpInfo = ns.gang.getMemberInformation(m);
					tmpInfo.lastAscended = 0;
					tmpInfo.equipemntCostSinceAscention = 0;
					fullGangMembersInfo.push(tmpInfo);
				});

				await getLockAndUpdate(ns,'fullGangMembersInfo',fullGangMembersInfo);
				await ns.sleep(200);
			}
				else {
					for(let _a = 0; a <ns.gang.getMemberNames().length; a++ ){
						if (tmpFullGangMembersInfo.some(e => e.Name === ns.gang.getMemberNames()[a].name)) {
							/* Member exists in persistant fullGangMembersInfo */
						  } else {
							  ns.print(`${mb.name} was not in persistant fullGangMembersInfo... adding now`);
							let tmpInfo = ns.gang.getMemberInformation(ns.gang.getMemberNames()[a].name);
							tmpInfo.lastAscended = 0;
							tmpInfo.equipemntCostSinceAscention = 0;
							tmpFullGangMembersInfo.push(tmpInfo);
							sessionStorage.removeItem('fullGangMembersInfo_Locked');
							await getLockAndUpdate(ns,'fullGangMembersInfo',tmpFullGangMembersInfo);
							await ns.sleep(200);
						  }
					}
				}
			}
			fullGangMembersInfo = getItem(ns, 'fullGangMembersInfo');
			await ns.sleep(300);
		
	
	var letCreate = false;
	while (!await ns.gang.inGang()) {
		let facInvites = getItem(ns, 'factionInvitations');
		if (facInvites !== null && facInvites.includes('The Syndicate')) {
			ns.run('/_scriptRamHelpers/_joinFaction', 'The Syndicate');
			await ns.sleep(1000);
		}
		await ns.sleep(1000);
		if (facInvites !== null && facInvites.includes('Slum Snakes')) {
			ns.run('/_scriptRamHelpers/_joinFaction', 'Slum Snakes');
			await ns.sleep(1000);
		}
		if (ns.getPlayer().factions.includes("The Syndicate")) {
			ns.print("Joining The Syndicate");
			letCreate = await ns.gang.createGang("The Syndicate");
		} else if (ns.getPlayer().factions.includes("Slum Snakes")) {
			letCreate = await ns.gang.createGang("Slum Snakes");
		}
		if (letCreate) {
			ns.alert("Created your gang!");
			ns.print("CREATED GANG !!!!!");
			if (ns.scriptRunning('factionUpAugs.js', 'home')) {
				await ns.scriptKill('factionUpAugs.js', 'home');
				await ns.sleep(1000);
				await ns.run('factionUpAugs.js', 1, 'autowork');
			}
		}
		await ns.sleep(60000);
	}

	if (verbose) ns.print(fullGangMembersInfo);

	previousTerritoryHeld = ns.gang.getGangInformation().territory.toLocaleString('en-US');
	ns.print(`Territory Held: ${100 * previousTerritoryHeld}`);



	var members = ns.gang.getMemberNames();
	while (true) {
		if (members.length >= 12) {
			var destinationTask = "Territory Warfare";
			if (fullTeam == true) {
				jumpLevels = [["Train Combat", 300], ["Terrorism", 500], ["Territory Warfare", 600], ["Human Trafficking", 5900000]];
				if (ns.gang.getGangInformation().territory < 1 && await calculateWarChance(ns) < goToWarWhenChancesOver) {
					jumpLevels = [["Train Combat", 300], ["Terrorism", 350], ["Territory Warfare", 3500], ["Human Trafficking", 5900000]];
				}

				if (endGameFocus == "Reputation") {
					jumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Terrorism", 99000000]];
				}
				if (endGameFocus == "Money") {
					jumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Human Trafficking", 99000000]];
				}
			}
		}
		else if (ns.gang.canRecruitMember()) {
			var append = false;
			var newMember = "";
			for (var a = 0; a < names.length; a++) {
				if (!members.includes(names[a]) && newMember == "") {
					await ns.gang.recruitMember(names[a]);
					await ns.sleep(1000);
					members = ns.gang.getMemberNames();
					newMember = names[a];
					ns.print("Added gang member " + newMember);
					let tmpInfo = ns.gang.getMemberInformation(newMember);
					tmpInfo.lastAscended = 0;
					tmpInfo.equipemntCostSinceAscention = 0;
					fullGangMembersInfo.push(tmpInfo);
					await getLockAndUpdate(ns,'fullGangMembersInfo',fullGangMembersInfo);
					await ns.sleep(200);
					
					
					if (!debugOnly) {
						await ns.gang.setMemberTask(newMember, "Train Combat");
					} else {
						ns.print(`___ Would be setting ${newMember} to 'Train Combat'`);
					}
					break;
				}
			}
		}
		await ns.print(" ");

		fullTeam = members.length >= 12;
		await evalMemberAscend(ns);
		await evalMemberUpgrades(ns);
		await evalCurrentRep(ns);
		await evalMemberTasks(ns);
		await evalGoToWar(ns);
		await ns.sleep(timeCycle * 1000);
	}
}


async function evalCurrentRep(ns) {
	let members = ns.gang.getMemberNames();
	var mygangInfo = ns.gang.getGangInformation();
	ns.print("Evaluating RepPenalty Level... " + Math.round(mygangInfo.wantedPenalty * 100) / 100);
	var thisMemberInfo = null;
	var prevTasks = Array();
	var hadToReBalance = false;
	for (var a = 0; a < members.length; a++) {
		thisMemberInfo = ns.gang.getMemberInformation(members[a]);
		prevTasks[members[a]] = thisMemberInfo.task;
	}
	while (mygangInfo.wantedPenalty < (1 - (repThreshold / 100))) {
		hadToReBalance = true;
		ns.print(`  Rep Level: ${mygangInfo.wantedPenalty} ...Rebalancing Member Tasks`);
		ns.print(`   Current rate of wanted change: ${mygangInfo.wantedLevelGainRate}`);
		for (var a = 0; a < members.length; a++) {
			if (mygangInfo.wantedLevelGainRate >= 0 || mygangInfo.wantedLevelGainRate == undefined) {
				thisMemberInfo = ns.gang.getMemberInformation(members[a]);
				if ((mygangInfo.respect / mygangInfo.wantedLevel) <= 2) {
					if (a == 0) { // First person needs to Mug for initial Rep offset
						if (!debugOnly) {
							await ns.gang.setMemberTask(members[a], "Mug People");
							ns.print(`    setting ${members[a]} to Mug People`);
						} else {
							ns.print(`___ Would be setting ${members[a]} to 'Mug People' in evalCurrentRep()`);
						}
						mygangInfo = ns.gang.getGangInformation();
					}
					if ((mygangInfo.wantedLevel - mygangInfo.respect) > 0 && a == 1) {
						if (!debugOnly) {
							await ns.gang.setMemberTask(members[a], "Mug People");
							ns.print(`    setting ${members[a]} to Mug People`);
						} else {
							ns.print(`___ Would be setting ${members[a]} to 'Mug People' in evalCurrentRep()`);
						}
						mygangInfo = ns.gang.getGangInformation();
					}
				}
				if (thisMemberInfo.task != "Vigilante Justice" && a != 0 && (ns.gang.getMemberNames().length < 3 || a != 1)) {
					if (!debugOnly) {
						await ns.gang.setMemberTask(members[a], "Vigilante Justice");
						ns.print(`    setting ${members[a]} to Vigilante Justice`);
					} else {
						ns.print(`___ Would be setting ${members[a]} to 'Vigilante Justice' in evalCurrentRep()`);
					}
					mygangInfo = ns.gang.getGangInformation();
				}
			}
		}
		mygangInfo = ns.gang.getGangInformation();

		if (ns.gang.canRecruitMember()) {
			ns.print("Recruiting new member while in Rep Fixing loop");
			var append = false;
			var newMember = "";
			for (var a = 0; a < names.length; a++) {
				if (!members.includes(names[a]) && newMember == "") {
					await ns.gang.recruitMember(names[a]);
					await ns.sleep(1000);
					members = ns.gang.getMemberNames();
					newMember = names[a];
					let tmpInfo = ns.gang.getMemberInformation(newMember);
					tmpInfo.lastAscended = 0;
					tmpInfo.equipemntCostSinceAscention = 0;
					fullGangMembersInfo.push(tmpInfo);
					await getLockAndUpdate(ns,'fullGangMembersInfo',fullGangMembersInfo);
					await ns.sleep(300);
					ns.print("Added gang member " + newMember);
					if (!debugOnly) {
						await ns.gang.setMemberTask(newMember, "Train Combat");
					} else {
						ns.print(`___ Would be setting ${newMember} to 'Train Combat' in evalCurrentRep() canRecruitMember()`);
					}
					break;
				}
			}
		}

		await ns.sleep(60000);
		await evalMemberUpgrades(ns);
	}
	if (hadToReBalance == true) {
		ns.print("_Re-assigning tasks");
		for (var a = 0; a < members.length; a++) {
			if (!debugOnly) {
				ns.print(`setting ${members[a]} back to ${prevTasks[members[a]]}`);
				await ns.gang.setMemberTask(members[a], prevTasks[members[a]]);
			} else {
				ns.print(`___ Would be setting ${members[a]} to '${prevTasks[members[a]]}' in evalCurrentRep() -> after rebalancing`);

			}
		}
	}
}

function selectAction(jumpLevels, gangInfo, memberInfo) {
	let destinationTask = 'Train Combat';

	for (let JL in jumpLevels) {
		if (memberInfo.str > jumpLevels[JL][1]) {
			if (verbose) ns.print(`evaluating ${memberInfo.name} str ${memberInfo.str} > ${jumpLevels[JL][1]} JL=${JL}`);
			continue;
		} else {
			if (verbose) ns.print(`evaluating ${memberInfo.name} str ${memberInfo.str} <= ${jumpLevels[JL][1]} JL=${JL} so setting destinationTask= ${jumpLevels[JL][0]}`);
			destinationTask = jumpLevels[JL][0];
			break;
		}
	}
	return destinationTask;
}
/**
 * return GangMemberInfo
 */
function findStrongestMember(fullGangMembersInfo) {
	var strongest = fullGangMembersInfo.reduce(function (prev, current) {
		if (+current.str > +prev.str) {
			return current;
		} else {
			return prev;
		}
	});
	return strongest;
}

async function evalMemberTasks(ns) {
	let members = ns.gang.getMemberNames();

	var thisMemberInfo = null;
	var originalJumpLevels = [["Train Combat", 90], ["Mug People", 130], ["Strongarm Civilians", 400], ["Terrorism", 550], ["Human Trafficking", 950], ["Terrorism", 100000000]];
	let tmpJumpLevels = originalJumpLevels;
	ns.print("Re-evaluating member tasks for harder tasks");
	let membersInWarfare = 0;
	let membersAtTerror = 0;


	fullGangMembersInfo.sort(function (a, b) {
		return a.str - b.str;

	});

	for (let a = 0; a < fullGangMembersInfo.length; a++) {
		fullGangMembersInfo[a] = ns.gang.getMemberInformation(fullGangMembersInfo[a].name);
		if (fullGangMembersInfo[a].task == 'Territory Warfare') {
			membersInWarfare++;
		}
		if (fullGangMembersInfo[a].task == 'Terrorism') {
			membersAtTerror++;
		}


		thisMemberInfo = fullGangMembersInfo[a];
		var destinationTask = "Territory Warfare";
		if (fullTeam == true) {
			tmpJumpLevels = [["Train Combat", 300], ["Terrorism", 500], ["Territory Warfare", 600], ["Human Trafficking", 5900000]];
			if (ns.gang.getGangInformation().territory < 1 && await calculateWarChance(ns) < goToWarWhenChancesOver) {
				tmpJumpLevels = [["Train Combat", 300], ["Terrorism", 350], ["Territory Warfare", 3500], ["Human Trafficking", 5900000]];
			}

			if (endGameFocus == "Reputation") {
				tmpJumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Terrorism", 99000000]];
			}
			if (endGameFocus == "Money") {
				tmpJumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Human Trafficking", 99000000]];
			}
			if (members.length >= 12 && membersInWarfare >= maximumFullGangAtWar) {
				tmpJumpLevels = originalJumpLevels;
			}
		}
		let withoutWarfare = null;
		if (membersInWarfare > gangSettings.maxMembersAtWarfareBeforeWar) {
			if (debugOnly) {
				ns.print("INSIDE TOO MANY AT Pre-War warfare");
			}
			withoutWarfare = tmpJumpLevels.filter(function (jl, index) {
				return jl[0] != "Territory Warfare";
			});
			ns.print(withoutWarfare);
		}
		tmpJumpLevels[0][1] = thisMemberInfo.str_asc_mult * gangSettings.trainCombatStrAscMult_multiplier;
		if(debugOnly || verbose) {
			ns.print(`Set JumpLevel Training to ${tmpJumpLevels[0][1]} for ${thisMemberInfo.name}`);
		}
		destinationTask = selectAction(withoutWarfare ?? tmpJumpLevels, ns.gang.getGangInformation(), ns.gang.getMemberInformation(members[a]));

		if (thisMemberInfo.task != destinationTask) {
			if (!debugOnly) {
				ns.print(` Upgrading ${members[a]} from ${thisMemberInfo.task} to ${destinationTask}`);
				if (thisMemberInfo.task == 'Territory Warfare') {
					membersInWarfare--;
				}
				if (thisMemberInfo.task == 'Terrorism') {
					membersAtTerror--;
				}
				if (destinationTask == 'Territory Warfare') {
					membersInWarfare++;
				}
				if (destinationTask == 'Terrorism') {
					membersAtTerror++;
				}
				ns.gang.setMemberTask(members[a], destinationTask);
			} else {
				ns.print(`___ Would be setting ${members[a]} to '${destinationTask}' in evalMemberTasks()`);
				if (thisMemberInfo.task == 'Territory Warfare') {
					membersInWarfare--;
				}
				if (thisMemberInfo.task == 'Terrorism') {
					membersAtTerror--;
				}
				if (destinationTask == 'Territory Warfare') {
					membersInWarfare++;
				}
				if (destinationTask == 'Terrorism') {
					membersAtTerror++;
				}
			}
		}
	}
	let sm = findStrongestMember(fullGangMembersInfo);
	if (fullTeam == true && membersAtTerror < minimumFullGangTerror && sm.task != 'Terrorism') {
		if (!debugOnly) {
			ns.print(`Forcing ${sm.name} to 'Terrorism' to make minimum`);
			ns.gang.setMemberTask(sm.name, "Terrorism");
		} else {
			ns.print(`___ Would be Forcing ` + sm.name + ` to 'Terrorism' in evalMemberTasks()-> membersAtTerror < minimum`);
		}
		membersAtTerror++;
	}
	await getLockAndUpdate(ns,'fullGangMembersInfo',fullGangMembersInfo);
	await ns.sleep(300);
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
	if (purchaseHackingAugs == true) {
		equipmentList.concat([
			'NUKE Rootkit',
			'Soulstealer Rootkit',
			'Demon Rootkit',
			'Hmap Node',
			'Jack the Ripper']);
	}
	var thisMemberInfo = null;

	fullGangMembersInfo.sort(function (a, b) {
		return a.str_mult - b.str_mult;

	});

	for (const equip of equipmentList) {
		for (var a = 0; a < fullGangMembersInfo.length; a++) {

			thisMemberInfo = fullGangMembersInfo[a];
			if (!thisMemberInfo.upgrades.includes(equip) && !thisMemberInfo.augmentations.includes(equip)) {
				if (ns.getServerMoneyAvailable("home") > ns.gang.getEquipmentCost(equip)) {
					if (!debugOnly || equipOnly) {
						ns.print(` Buying ${equip} for ${thisMemberInfo.name}`);
						ns.gang.purchaseEquipment(thisMemberInfo.name, equip);
					} else {
						ns.print(`___ Would be buying ${equip} for  ${thisMemberInfo.name} str_multi: ${thisMemberInfo.str_mult}`);
					}
					fullGangMembersInfo[fullGangMembersInfo.findIndex( ({name}) => name == thisMemberInfo.name )] = ns.gang.getMemberInformation(thisMemberInfo.name);
					fullGangMembersInfo.find( ({name}) => name == thisMemberInfo.name ).equipemntCostSinceAscention += ns.gang.getEquipmentCost(equip);
					await getLockAndUpdate(ns,'fullGangMembersInfo',fullGangMembersInfo);
					await ns.sleep(200);
					//myGang[thisMemberInfo.name].equipemntCostSinceAscention += ns.gang.getEquipmentCost(equip);
				}
			}

		}
	}
}

async function evalMemberAscend(ns) {
	var thisMemberInfo = null;
	let members = ns.gang.getMemberNames();
	ns.print("Evaluating members for ascention");
	var ascendCounter = 0;
	let gangInfo = ns.gang.getGangInformation();
	let respectLeft = Math.floor(gangInfo.respect / 2);

	fullGangMembersInfo.sort(function (a, b) {
		return a.str_mult - b.str_mult;
	});
	
	for (var a = 0; a < fullGangMembersInfo.length; a++) {
		//var ascend = false;
		thisMemberInfo = fullGangMembersInfo[a];
		if (thisMemberInfo.earnedRespect == undefined) {
			thisMemberInfo.earnedRespect = 0;
		}
		if(verbose) ns.print(`Evaluating ${thisMemberInfo.name}`);
		var ascendPotentional = ns.gang.getAscensionResult(members[a]);
		if (ascendPotentional !== null && ascendPotentional !== undefined) {
			if ((gangInfo.respect - thisMemberInfo.earnedRespect) > gangInfo.wantedLevel) {
				if (ascentionEnabled && ns.getServerMoneyAvailable('home') > gangSettings.moneyInBankToAscend && (ascendPotentional.str > ascentionStatReqs.strength || ascendPotentional.dex > ascentionStatReqs.dexterity || ascendPotentional.agi > ascentionStatReqs.agility)) {
					if (!ns.gang.getGangInformation().territoryWarfareEngaged || ascendCounter <= maxMembersToAscendDuringWar) {
						let timeSinceAscention = Date.now() - fullGangMembersInfo.find( ({name}) => name == thisMemberInfo.name ).lastAscended;
						if ((timeSinceAscention >= timeToHoldOffOnAscentionAfterEquipping && fullGangMembersInfo.find( ({name}) => name == thisMemberInfo.name ).equipemntCostSinceAscention <= costOfEquipmentToPauseAscention)
							|| timeSinceAscention >= maxTimeBetweenAscention) {
							if (!debugOnly) {
								ns.print(` Ascending ${thisMemberInfo.name}`);
								await ns.gang.ascendMember(thisMemberInfo.name);
								await ns.sleep(150);
								ns.gang.setMemberTask(thisMemberInfo.name, "Train Combat");
							} else {
								ns.print(`___ Would be Ascending ${thisMemberInfo.name} setting to 'Train Combat' in evalMemberAscend() cur.str_mult: ${thisMemberInfo.str_mult} cur.str_asc_mult ${thisMemberInfo.str_asc_mult} asc_res: ${ns.gang.getAscensionResult(members[a]).str}`);
							}
							gangInfo = ns.gang.getGangInformation();
							respectLeft = respectLeft - ascendPotentional.respect;
							ascendCounter++;
							//myGang[thisMemberInfo.name].lastAscended = Date.now();
							//myGang[thisMemberInfo.name].equipemntCostSinceAscention = 0;
							fullGangMembersInfo[fullGangMembersInfo.findIndex( ({name}) => name == thisMemberInfo.name )] = ns.gang.getMemberInformation(thisMemberInfo.name);
							fullGangMembersInfo.find( ({name}) => name == thisMemberInfo.name ).lastAscended = Date.now();
							fullGangMembersInfo.find( ({name}) => name == thisMemberInfo.name ).equipemntCostSinceAscention = 0;
							await getLockAndUpdate(ns,'fullGangMembersInfo',fullGangMembersInfo);
							await ns.sleep(200);
						} else {
							if (verbose) ns.print(` Did NOT ascend ${thisMemberInfo.name} because of Equipment Purchase Timing`);
						}
					} else {
						if (verbose) ns.print(` ascending ${thisMemberInfo.name} would incur too much loss on Gang rep during war`);
					}
				} else {
					if (verbose) {
						if (!ascentionEnabled) {
							ns.print("Ascention is not enabled");
						} else
							if (ns.getServerMoneyAvailable('home') <= gangSettings.moneyInBankToAscend) {
								ns.print(`Minimum waiting money not met to Ascend ${ns.getServerMoneyAvailable('home')}  !> ${gangSettings.moneyInBankToAscend}`);
							}
							else {
								let reason = `Stat threshold for ${thisMemberInfo.name} not met:`;
								if (ascendPotentional.str <= ascentionStatReqs.strength) {
									reason += ` Strength ${ascendPotentional.str} !> ${ascentionStatReqs.strength}`;
								}
								if (ascendPotentional.dex <= ascentionStatReqs.dexterity) {
									reason += ` Dexterity ${ascendPotentional.dex} !> ${ascentionStatReqs.dexterity}`;
								}
								if (ascendPotentional.agi <= ascentionStatReqs.agility) {
									reason += ` Agility ${ascendPotentional.agi} !> ${ascentionStatReqs.agility}`;
								}
								ns.print(reason);
							}

						ns.print(` ${thisMemberInfo.name} not ready for Ascention`);
					}
				}
			} else {
				if (verbose) ns.print(` ascending ${thisMemberInfo.name} would drop gang rep below wanted level.\n\t${gangInfo.respect} - ${thisMemberInfo.earnedRespect} > ${gangInfo.wantedLevel}`);
			}
		} else if (verbose) ns.print(` no ascention potential for ${thisMemberInfo.name}`);
	}
}


async function calculateWarChance(ns) {
	let otherGangs = ns.gang.getOtherGangInformation();
	let lowestChance = 100;

	for (const otherGang in otherGangs) {
		if (otherGang != ns.gang.getGangInformation().faction && otherGangs[otherGang].territory > 0) {
			let ourChance = ns.gang.getChanceToWinClash(otherGang);
			if (verbose) ns.print(`  Chance to win against ${otherGang} is ${ourChance}%`);
			if (ourChance < lowestChance) lowestChance = ourChance;
		}
	}

	return (lowestChance * 100);
}
async function evalGoToWar(ns) {
	ns.print("Evaluating Territory Warefare");
	let lowestChance = await calculateWarChance(ns);
	let goToWar = false;
	let atWar = ns.gang.getGangInformation().territoryWarfareEngaged;
	let threshold = goToWarWhenChancesOver;
	if (atWar) {
		threshold -= 5; // If we're at war, allow us to continue with a margin of 5% under
	}
	if (lowestChance >= threshold) {
		goToWar = true;
	}
	if (atWar) {
		ns.print(` Warfare change in territory: ${((ns.gang.getGangInformation().territory - previousTerritoryHeld) * 100).toLocaleString('en-US')}`);
	}
	if (goToWar) {
		if (!atWar) {
			if (!debugOnly) {
				ns.print(` Enabling Territory Warfare: Our worstcase chance ${lowestChance.toLocaleString('en-US')} Threshold: ${threshold}`);
				ns.gang.setTerritoryWarfare(true);
			} else {
				ns.print(`___ Would be Enabling Territory Warfare`);
			}
		}
	} else {
		if (!debugOnly) {
			ns.print(` Disabling Territory Warfare: Our worstcase chance ${lowestChance.toLocaleString('en-US')} Threshold: ${threshold}`);
			ns.gang.setTerritoryWarfare(false);
		} else {
			ns.print(`___ Would be Disabling Territory Warfare`);
		}
	}
}
