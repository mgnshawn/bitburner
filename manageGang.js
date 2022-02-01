import { getItem, setItem, getLockAndUpdate } from '/_helpers/ioHelpers.js';
/** @type import(".").NS */
var ns;
var gangSettings = {
	'maxMembersAtWarfareBeforeWar': 2, 'moneyInBankToAscend': 100000000, 'trainCombatStrAscMult_multiplier': 1100,
	'reearnRepAfterAsc': [[1, 150], [10, 1000], [20, 10000], [30, 100000], [40, 1000000], [50, 10000000], [1000, 100000000]],
	'ascentionStatReqs': { 'strength': 1.10, 'dexterity': 1.3, 'agility': 1.3 },
	'minimumMembersAtWarDuringWarfare': 2, 'minimumMembersAtWarDuringPeace': 1
};
var repThreshold = 15; // When to switch to improving wanted level


const goToWarWhenChancesOver = 70
const maximumFullGangAtWar = 8; // Most members that can being doing Territory Warface
const minimumFullGangTerror = 1; // Minimum number of members doing Terrorism
const maxMembersToAscendDuringWar = 2;

var previousTerritoryHeld = 0;

var endGameFocus = "Reputation"; //options Reputation, Money\
var endGameFocusOptions = ['Reputation', 'Money'];

var timeToHoldOffOnAscentionAfterEquipping = 5 * 60 * 1000;
var costOfEquipmentToPauseAscention = 50000000;
var maxTimeBetweenAscention = 15 * 60 * 1000;
var timeCycle = 1 * 60;


var fullGangMembersInfo;
var verbose;
var ascentionEnabled;
var debugOnly;
var equipOnly;
var fullTeam;
var purchaseHackingAugs;
// If a gang member's string is under the number it selects the highest option
var originalJumpLevels = [["Train Combat", 90], ["Mug People", 130], ["Strongarm Civilians", 400], ["Terrorism", 550], ["Human Trafficking", 950], ["Terrorism", 100000000]];
var names = ['shawn', 'joe', 'mike', 'heather', 'irene', 'anna', 'tony', 'bobby', 'billy', 'lance', 'sarah', 'misty'];

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

	verbose = false;
	ascentionEnabled = true;
	debugOnly = false;
	equipOnly = false;
	fullTeam = false;
	purchaseHackingAugs = false;

	let tmpFullGangMembersInfo = getItem(ns, 'fullGangMembersInfo');
	await ns.sleep(300);
	let membersRepairedorPrepped = false;
	for (let z = 0; z < ns.args.length; z++) {
		if (ns.args[z] !== undefined && ['h', '-h', '?', '-?'].includes(ns.args[z])) {
			ns.tprint(`arguments (v) (debugonly)  (equiponly)  (endgamefocus:[money,reputation] (freshstart)`);
			ns.exit();
		}
		if (ns.args[z] == 'v') {
			verbose = true;
		}

		if (ns.args[z] == "unlock") {
			sessionStorage.removeItem('fullGangMembersInfo_Locked');
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
			endGameFocus = ns.args[z + 1][0].toUpperCase + ns.args[z + 1].slice(1);
			ns.print(`Setting EndGame Focus To: ${endGameFocus}`);
		}

		if (verbose) ns.print("VERBOSE");
		if (membersRepairedorPrepped == false) {
			if (tmpFullGangMembersInfo == undefined) ns.tprint('UNDEFINED');
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

				await getLockAndUpdate(ns, 'fullGangMembersInfo', fullGangMembersInfo);
				await ns.sleep(200);
			}
			else {
				for (let a = 0; a < ns.gang.getMemberNames().length; a++) {
					if (tmpFullGangMembersInfo.some(e => e.name === ns.gang.getMemberNames()[a])) {

						/* Member exists in persistant fullGangMembersInfo */
						let thisMemberInfo = tmpFullGangMembersInfo.find(e => e.name === ns.gang.getMemberNames()[a]);
						let indexOfMember = tmpFullGangMembersInfo[tmpFullGangMembersInfo.findIndex(({ name }) => name == thisMemberInfo.name)]

						if (thisMemberInfo.lastAscended == undefined || thisMemberInfo.equipemntCostSinceAscention) {
							ns.print(`Recreating lastAscended for ${thisMemberInfo.name}`);
							thisMemberInfo.lastAscended = Date.now();
							thisMemberInfo.equipemntCostSinceAscention = 0;

							tmpFullGangMembersInfo[indexOfMember] = thisMemberInfo;
							await getLockAndUpdate(ns, 'fullGangMembersInfo', tmpFullGangMembersInfo);
							await ns.sleep(200);
						}
					} else {
						ns.print(`${ns.gang.getMemberNames()[a]} was not in persistant fullGangMembersInfo... adding now`);
						let tmpInfo = ns.gang.getMemberInformation(ns.gang.getMemberNames()[a]);
						tmpInfo.lastAscended = 0;
						tmpInfo.equipemntCostSinceAscention = 0;
						tmpFullGangMembersInfo.push(tmpInfo);
						sessionStorage.removeItem('fullGangMembersInfo_Locked');
						await getLockAndUpdate(ns, 'fullGangMembersInfo', tmpFullGangMembersInfo);
						await ns.sleep(200);
					}
				}
			}
			membersRepairedorPrepped = true;
		}
	}
	fullGangMembersInfo = getItem(ns, 'fullGangMembersInfo');
	if (fullGangMembersInfo == undefined) {
		fullGangMembersInfo = [];
	}
	ns.tail();
	await ns.sleep(300);

	var letCreate = false;
	while (!await ns.gang.inGang()) {
		let facInvites = getItem(ns, 'factionInvitations');
		if (facInvites !== null && facInvites !== undefined) {
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
		} else
			if (ns.getPlayer().factions.includes('Slum Snakes')) {
				letCreate = await ns.gang.createGang('Slum Snakes');
			} else
				if (ns.getPlayer().factions.includes('The Syndicate')) {
					letCreate = await ns.gang.createGang('The Syndicate');
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

	previousTerritoryHeld = ns.gang.getGangInformation().territory.toLocaleString('en-US');
	ns.print(`Territory Held: ${100 * previousTerritoryHeld}`);



	var members = ns.gang.getMemberNames();
	while (true) {
		if (members.length >= 12) {
			var destinationTask = "Territory Warfare";
			if (fullTeam == true) {
				originalJumpLevels = [["Train Combat", 300], ["Terrorism", 500], ["Territory Warfare", 600], ["Human Trafficking", 5900000]];
				if (ns.gang.getGangInformation().territory < 1 && await calculateWarChance(ns) < goToWarWhenChancesOver) {
					originalJumpLevels = [["Train Combat", 300], ["Terrorism", 350], ["Territory Warfare", 3500], ["Human Trafficking", 5900000]];
				}

				if (endGameFocus == "Reputation") {
					originalJumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Terrorism", 99000000]];
				}
				if (endGameFocus == "Money") {
					originalJumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Human Trafficking", 99000000]];
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
					await getLockAndUpdate(ns, 'fullGangMembersInfo', fullGangMembersInfo);
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
					/*if (a == 0) { // First person needs to Mug for initial Rep offset
						if (!debugOnly) {
							await ns.gang.setMemberTask(members[a], "Mug People");
							ns.print(`    setting ${members[a]} to Mug People`);
						} else {
							ns.print(`___ Would be setting ${members[a]} to 'Mug People' in evalCurrentRep()`);
						}
						mygangInfo = ns.gang.getGangInformation();
					}*/
					if ((mygangInfo.wantedLevel - mygangInfo.respect) > 0 && a == 1 && ns.gang.getMemberNames().length > 2) {
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
					await getLockAndUpdate(ns, 'fullGangMembersInfo', fullGangMembersInfo);
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
	let property = 'str';


	for (let JL in jumpLevels) {
		if (jumpLevels[JL].length > 2 && jumpLevels[JL][2] !== undefined) {
			property = jumpLevels[JL][2];
		} else {
			property = 'str';
		}
		if (memberInfo[property] > jumpLevels[JL][1]) {
			if (verbose) ns.print(`evaluating ${memberInfo.name} ${property} ${memberInfo[property]} > ${jumpLevels[JL][1]} JL=${JL}`);
			continue;
		} else {
			if (verbose) ns.print(`evaluating ${memberInfo.name} ${property} ${memberInfo[property]} <= ${jumpLevels[JL][1]} JL=${JL} so setting destinationTask= ${jumpLevels[JL][0]}`);
			destinationTask = jumpLevels[JL][0];
			break;
		}
	}
	return destinationTask;
}
/**
 * return GangMemberInfo
 */
function findStrongestMember(fullGangMembersInfo, numberFromTop = 0) {
	/*var strongest = fullGangMembersInfo.reduce(function (prev, current) {
		if (+current.str > +prev.str) {
			return current;
		} else {
			return prev;
		}
	});
	return strongest;*/
	let tmpMembers = fullGangMembersInfo;
	tmpMembers.sort((a, b) => +a.str - +b.str);
	return tmpMembers[tmpMembers.length - 1 - numberFromTop];
}

async function evalMemberTasks(ns) {
	let members = ns.gang.getMemberNames();

	var thisMemberInfo = null;
	let tmpJumpLevels = originalJumpLevels;
	ns.print("Re-evaluating member tasks for harder tasks");
	let membersInWarfare = 0;
	let membersAtTerror = 0;

	fullGangMembersInfo = getItem(ns, 'fullGangMembersInfo');
	await ns.sleep(500);
	fullGangMembersInfo.sort(function (a, b) {
		return a.str - b.str;
	});

	for (let a = 0; a < fullGangMembersInfo.length; a++) {
		if (fullGangMembersInfo[a].task == 'Territory Warfare') {
			membersInWarfare++;
		}
		if (fullGangMembersInfo[a].task == 'Terrorism') {
			membersAtTerror++;
		}

		fullGangMembersInfo[a].task = ns.gang.getMemberInformation(fullGangMembersInfo[a].name).task;
		thisMemberInfo = fullGangMembersInfo[a];

		if (verbose) ns.print(`----- Beginning Eval on ${thisMemberInfo.name}`);
		var destinationTask = "Territory Warfare";
		if (fullTeam == true) {
			tmpJumpLevels = [["Train Combat", 300], ["Terrorism", 500], ["Territory Warfare", 600], ["Human Trafficking", 5900000]];
			if (ns.gang.getGangInformation().territory < 1 && await calculateWarChance(ns) < goToWarWhenChancesOver) {
				tmpJumpLevels = [["Train Combat", 300], ["Terrorism", 350], ["Human Trafficking", 1000], ["Territory Warfare", 1500], ["Human Trafficking", 5900000]];
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
			tmpJumpLevels = withoutWarfare;
		}

		//-- Set first task 'Train Combat' to train up to a level comenserate with their strength_multiplier
		let reearnRespectTo = 0;
		for (let er in gangSettings.reearnRepAfterAsc) {
			if (thisMemberInfo.str_asc_mult > gangSettings.reearnRepAfterAsc[er][0]) {
				continue;
			} else {
				if (er > 0)
					reearnRespectTo = gangSettings.reearnRepAfterAsc[er - 1][1];
				else
					reearnRespectTo = 200;
				break;
			}

		};
		if (thisMemberInfo.earnedRespect < reearnRespectTo) {
			if (verbose) ns.print(`Re-earn respect after Combat Training will be set to ${reearnRespectTo}`);
			else {
				if (verbose) ns.print(`Re-earn respect not needed, limit ${reearnRespectTo} < ${thisMemberInfo.earnedRespect}`);
			}

			tmpJumpLevels[0][1] = thisMemberInfo.str_asc_mult * gangSettings.trainCombatStrAscMult_multiplier;
			if (thisMemberInfo.str_asc_mult == 1) {
				tmpJumpLevels[0][1] = 90;
			} else if (thisMemberInfo.str_asc_mult < 2) {
				tmpJumpLevels[0][1] = 500;
			} else if (thisMemberInfo.str_asc_mult < 3.25) {
				tmpJumpLevels[0][1] = 750;
			} else if (thisMemberInfo.str_asc_mult < 4) {
				tmpJumpLevels[0][1] = 900;
			} else if (thisMemberInfo.str_asc_mult < 5) {
				tmpJumpLevels[0][1] = 1050;
			} else if (thisMemberInfo.str_asc_mult < 6) {
				tmpJumpLevels[0][1] = 1200; ``
			} else if (thisMemberInfo.str_asc_mult < 12) {
				tmpJumpLevels[0][1] = 1900; ``
			}
			if (withoutWarfare) {
				withoutWarfare[0][1] = tmpJumpLevels[0][1];
			}

			if (thisMemberInfo.str > 350) {
				if (tmpJumpLevels.length > 1) {
					tmpJumpLevels[1] = ["Terrorism", reearnRespectTo, "earnedRespect"];
					if (withoutWarfare) withoutWarfare[1] = ["Terrorism", reearnRespectTo, "earnedRespect"];
				} else {
					tmpJumpLevels.push(["Terrorism", reearnRespectTo, "earnedRespect"]);
					if (withoutWarfare) withoutWarfare.push(["Terrorism", reearnRespectTo, "earnedRespect"]);
				}
			} else {
				if (verbose) ns.print(`Re-earn respect after Combat Training not set because ${thisMemberInfo.name} stength ${thisMemberInfo.str_asc_mult} < 350`);
			}
		} else {
			if (verbose) {
				ns.print(`Skipping testing :: ${thisMemberInfo.name}.earnedRespect because ${thisMemberInfo.earnedRespect} !< ${reearnRespectTo}`);
			}
		}
		if (debugOnly || verbose) {
			if (withoutWarfare != null) {
				ns.print(`Set JumpLevel Training to ${withoutWarfare[0][1]} for ${thisMemberInfo.name} via withoutWarfare`);
				ns.print(withoutWarfare);
			} else {
				ns.print(`Set JumpLevel Training to ${tmpJumpLevels[0][1]} for ${thisMemberInfo.name} via jumpLevels`);
				ns.print(tmpJumpLevels);
			}

		}

		await ns.sleep(300);
		destinationTask = selectAction(withoutWarfare ?? tmpJumpLevels, ns.gang.getGangInformation(), ns.gang.getMemberInformation(thisMemberInfo.name));

		if (thisMemberInfo.task != destinationTask) {
			if (!debugOnly) {
				ns.print(` Upgrading ${thisMemberInfo.name} from ${thisMemberInfo.task} to ${destinationTask}`);
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
				ns.gang.setMemberTask(thisMemberInfo.name, destinationTask);
			} else {
				ns.print(`___ Would be setting ${thisMemberInfo.name} to '${destinationTask}' in evalMemberTasks()`);
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
	sm = findStrongestMember(fullGangMembersInfo, 1);
	if (ns.gang.getGangInformation().territory < 1 && await calculateWarChance(ns) > goToWarWhenChancesOver && membersInWarfare < gangSettings.minimumMembersAtWarDuringWarfare) {
		if (!debugOnly) {
			ns.print(`Forcing ${sm.name} to 'Territory Warfare' to make minimum`);
			ns.gang.setMemberTask(sm.name, "Territory Warfare");
		} else {
			ns.print(`___ Would be Forcing ` + sm.name + ` to 'Territory Warfare' in evalMemberTasks()-> membersInWarfare(during Warefare) < minimum`);
		}
		membersInWarfare++;
	} else
		if (ns.gang.getGangInformation().territory < 1 && await calculateWarChance(ns) < goToWarWhenChancesOver && membersInWarfare < gangSettings.minimumMembersAtWarDuringPeace) {
			if (!debugOnly) {
				ns.print(`Forcing ${sm.name} to 'Territory Warfare' to make minimum`);
				ns.gang.setMemberTask(sm.name, "Territory Warfare");
			} else {
				ns.print(`___ Would be Forcing ` + sm.name + ` to 'Territory Warfare' in evalMemberTasks()-> membersInWarfare(during Peace) < minimum`);
			}
			membersInWarfare++;
		}
	await getLockAndUpdate(ns, 'fullGangMembersInfo', fullGangMembersInfo);
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
	fullGangMembersInfo = getItem(ns, 'fullGangMembersInfo');
	await ns.sleep(500);

	fullGangMembersInfo.sort(function (a, b) {
		return a.str_mult - b.str_mult;
	});

	//for(let _a = 0; a <ns.gang.getMemberNames().length; a++ ){

	for (const equip of equipmentList) {
		for (var a = 0; a < fullGangMembersInfo.length; a++) {

			thisMemberInfo = fullGangMembersInfo[a];
			if (!ns.gang.getMemberInformation(thisMemberInfo.name).upgrades.includes(equip) && !ns.gang.getMemberInformation(thisMemberInfo.name).augmentations.includes(equip)) {
				if (ns.getServerMoneyAvailable("home") > ns.gang.getEquipmentCost(equip)) {
					if (!debugOnly || equipOnly) {
						ns.print(` Buying ${equip} for ${thisMemberInfo.name}`);
						ns.gang.purchaseEquipment(thisMemberInfo.name, equip);
					} else {
						ns.print(`___ Would be buying ${equip} for  ${thisMemberInfo.name} str_multi: ${thisMemberInfo.str_mult}`);
					}
					//fullGangMembersInfo[fullGangMembersInfo.findIndex(({ name }) => name == thisMemberInfo.name)] = ns.gang.getMemberInformation(thisMemberInfo.name);
					//fullGangMembersInfo.find(({ name }) => name == thisMemberInfo.name).equipemntCostSinceAscention += ns.gang.getEquipmentCost(equip);
					let tmpMember = ns.gang.getMemberInformation(thisMemberInfo.name);
					tmpMember.equipemntCostSinceAscention += ns.gang.getEquipmentCost(equip);
					tmpMember.lastAscended = thisMemberInfo.lastAscended;
					fullGangMembersInfo[a] = tmpMember;


					await getLockAndUpdate(ns, 'fullGangMembersInfo', fullGangMembersInfo);
					await ns.sleep(200);
					//myGang[thisMemberInfo.name].equipemntCostSinceAscention += ns.gang.getEquipmentCost(equip);
				}
			}

		}
	}
	await getLockAndUpdate(ns, 'fullGangMembersInfo', fullGangMembersInfo);
	await ns.sleep(200);
}

async function evalMemberAscend(ns) {
	if (verbose) ns.print("STILL VERBOSE");
	var thisMemberInfo = null;
	let members = ns.gang.getMemberNames();
	ns.print("Evaluating members for ascention");
	var ascendCounter = 0;
	let gangInfo = ns.gang.getGangInformation();
	let respectLeft = Math.floor((gangInfo.respect - gangInfo.wantedLevel) / (members.length - 1));
	fullGangMembersInfo = getItem(ns, 'fullGangMembersInfo');
	await ns.sleep(500);
	fullGangMembersInfo.sort(function (a, b) {
		return a.str_mult - b.str_mult;
	});

	for (var a = 0; a < fullGangMembersInfo.length; a++) {
		//var ascend = false; 
		thisMemberInfo = fullGangMembersInfo[a];

		if (thisMemberInfo.earnedRespect == undefined) {
			thisMemberInfo.earnedRespect = 0;
		}

		var ascendPotentional = ns.gang.getAscensionResult(thisMemberInfo.name);
		if (ascendPotentional !== null && ascendPotentional !== undefined) {
			if ((respectLeft - ascendPotentional.respect) > 0) {
				if (ascentionEnabled && ns.getServerMoneyAvailable('home') > gangSettings.moneyInBankToAscend && (ascendPotentional.str > gangSettings.ascentionStatReqs.strength || ascendPotentional.dex > gangSettings.ascentionStatReqs.dexterity || ascendPotentional.agi > gangSettings.ascentionStatReqs.agility)) {
					if (!ns.gang.getGangInformation().territoryWarfareEngaged || ascendCounter <= maxMembersToAscendDuringWar) {
						let timeSinceAscention = Date.now() - fullGangMembersInfo.find(({ name }) => name == thisMemberInfo.name).lastAscended;
						if ((timeSinceAscention >= timeToHoldOffOnAscentionAfterEquipping && fullGangMembersInfo.find(({ name }) => name == thisMemberInfo.name).equipemntCostSinceAscention <= costOfEquipmentToPauseAscention)
							|| timeSinceAscention >= maxTimeBetweenAscention) {
							if (!debugOnly) {
								ns.print(` Ascending ${thisMemberInfo.name}`);
								await ns.gang.ascendMember(thisMemberInfo.name);
								await ns.sleep(150);
								ns.gang.setMemberTask(thisMemberInfo.name, "Train Combat");
								fullGangMembersInfo[fullGangMembersInfo.findIndex(({ name }) => name == thisMemberInfo.name)] = ns.gang.getMemberInformation(thisMemberInfo.name);
								fullGangMembersInfo.find(({ name }) => name == thisMemberInfo.name).lastAscended = Date.now();
								fullGangMembersInfo.find(({ name }) => name == thisMemberInfo.name).equipemntCostSinceAscention = 0;
								await getLockAndUpdate(ns, 'fullGangMembersInfo', fullGangMembersInfo);
								await ns.sleep(200);
							} else {
								ns.print(`___ Would be Ascending ${thisMemberInfo.name} setting to 'Train Combat' in evalMemberAscend() cur.str_mult: ${thisMemberInfo.str_mult} cur.str_asc_mult ${thisMemberInfo.str_asc_mult} asc_res: ${ns.gang.getAscensionResult(thisMemberInfo.name).str}`);
							}
							gangInfo = ns.gang.getGangInformation();
							respectLeft = respectLeft - ascendPotentional.respect;
							ascendCounter++;
							//myGang[thisMemberInfo.name].lastAscended = Date.now();
							//myGang[thisMemberInfo.name].equipemntCostSinceAscention = 0;

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
								if (ascendPotentional.str <= gangSettings.ascentionStatReqs.strength) {
									reason += ` Strength ${ascendPotentional.str} !> ${gangSettings.ascentionStatReqs.strength}`;
								}
								if (ascendPotentional.dex <= gangSettings.ascentionStatReqs.dexterity) {
									reason += ` Dexterity ${ascendPotentional.dex} !> ${gangSettings.ascentionStatReqs.dexterity}`;
								}
								if (ascendPotentional.agi <= gangSettings.ascentionStatReqs.agility) {
									reason += ` Agility ${ascendPotentional.agi} !> ${gangSettings.ascentionStatReqs.agility}`;
								}
								ns.print(reason);
							}

						ns.print(` ${thisMemberInfo.name} not ready for Ascention`);
					}
				}
			} else {
				if (verbose) ns.print(` ascending ${thisMemberInfo.name} would drop gang rep below wanted level.\n\t${respectLeft} - ${ascendPotentional.respect} !> 0 || ${gangInfo.respect} - ${thisMemberInfo.earnedRespect} > ${gangInfo.wantedLevel}`);
			}
		} else if (verbose) ns.print(` no ascention potential for ${thisMemberInfo.name}`);
	}
	await getLockAndUpdate(ns, 'fullGangMembersInfo', fullGangMembersInfo);
	await ns.sleep(200);
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