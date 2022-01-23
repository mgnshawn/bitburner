/** @type import(".").NS */
var repThreshold = 15; // When to switch to improving wanted level
var timeCycle = 1 * 60;
var maximumMembersAtWarfareBeforeWar = 3;
var goToWarWhenChancesOver = 70
var maximumFullGangAtWar = 8; // Most members that can being doing Territory Warface
var minimumFullGangTerror = 1; // Minimum number of members doing Terrorism
var purchaseHackingAugs = false;
var verbose = false;
var previousTerritoryHeld = 0;
var maxMembersToAscendDuringWar = 2;
var endGameFocus = "Reputation"; //options Reputation, Money

var timeToHoldOffOnAscentionAfterEquipping = 5 * 60 * 1000;
var costOfEquipmentToPauseAscention = 50000000;
var maxTimeBetweenAscention = 15 * 60 * 1000;

var ascentionStatReqs = {'strength':1.5,'dexterity':1.7,'agility':1.7};
// If a gang member's string is under the number it selects the highest option
//var jumpLevels = {"Mug People":50,"Train Combat":100,"Strongarm Civilians":325,"Human Trafficking":500,"Terrorism":1500};
var jumpLevels = [["Train Combat", 90], ["Mug People", 130], ["Strongarm Civilians", 300], ["Human Trafficking", 500], ["Terrorism", 100000000]];
var names = ['shawn', 'joe', 'mike', 'heather', 'irene', 'anna', 'tony', 'bobby', 'billy', 'lance', 'sarah', 'misty'];
var myGang = {};

/** @param {import(".").NS } ns */
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
	ns.tail();

	for (let z = 0; z < ns.args.length; z++) {
		if (ns.args[z] !== undefined) {
			if (ns.args[z] == 'v') {
				verbose = true;
			}
			if (ns.args[z] == 'endgame' && ns.args[z + 1] !== undefined) {
				endGameFocus = ns.args[z + 1];
			}
		}
	}
	var letCreate = false;
	while (!await ns.gang.inGang()) {
		let facInvites = getItem(ns,'factionInvitations');
		if (facInvites !== null && facInvites.includes('The Syndicate')) {
			ns.run('/_scriptRamHelpers/_joinFaction','The Syndicate');
			await ns.sleep(1000);
		}
		await ns.sleep(1000);
		if (facInvites !== null && facInvites.includes('Slum Snakes')) {
			ns.run('/_scriptRamHelpers/_joinFaction','Slum Snakes');
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

	let currentMembers = ns.gang.getMemberNames();
	for (let c in currentMembers) {
		let m = createMemberObject(ns, currentMembers[c]);
		myGang[currentMembers[c]] = m;
	}
	if (verbose) ns.print(myGang);

	previousTerritoryHeld = ns.gang.getGangInformation().territory.toLocaleString('en-US');
	ns.print(`Territory Held: ${100 * previousTerritoryHeld}`);



	var members = ns.gang.getMemberNames();
	var recruitedLastRound = false;
	while (true) {
		if (members.length >= 12) {
			jumpLevels = [["Train Combat", 250], ["Terrorism", 350], ["Territory Warfare", 600], ["Human Trafficking", 5900000]];
			if (ns.gang.getGangInformation().territory < 1 && await calculateWarChance(ns) < goToWarWhenChancesOver) {
				jumpLevels = [["Train Combat", 250], ["Terrorism", 350], ["Territory Warfare", 3500], ["Human Trafficking", 5900000]];
			}
			if (ns.getServerMoneyAvailable("home") > 10000000000) {
				if (endGameFocus == "Reputation") {
					jumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Terrorism", 99000000]];
				}
				if (endGameFocus == "Money") {
					if (ns.gang.getGangInformation().territory < 1) {
						jumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Territory Warfare", 99000000]];
					} else {
						jumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Human Trafficking", 99000000]];

					}
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
					recruitedLastRound = true;
					members = ns.gang.getMemberNames();
					newMember = names[a];
					ns.print("Added gang member " + newMember);
					let newMemberObj = createMemberObject(ns, newMember);
					myGang[newMember] = newMemberObj;
					await ns.gang.setMemberTask(newMember, "Train Combat");
					break;
				}
			}
		} else {
			if (recruitedLastRound == true) {
				ns.print("Can't recruit just yet. Trying again in " + (timeCycle * 1000));

			}
		}
		await ns.print(" ");
		await ns.sleep(timeCycle * 1000);
		await evalMemberAscend(ns);
		await evalMemberUpgrades(ns);
		await evalCurrentRep(ns);
		await evalMemberTasks(ns);
		await evalGoToWar(ns);


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
						await ns.gang.setMemberTask(members[a], "Mug People");
						ns.print(`    setting ${members[a]} to Mug People`);
						mygangInfo = ns.gang.getGangInformation();
					}
					if ((mygangInfo.wantedLevel - mygangInfo.respect) > 0 && a == 1) {
						await ns.gang.setMemberTask(members[a], "Mug People");
						ns.print(`    setting ${members[a]} to Mug People`);
						mygangInfo = ns.gang.getGangInformation();
					}
				}
				if (thisMemberInfo.task != "Vigilante Justice" && a != 0 && (ns.gang.getMemberNames().length < 3 || a != 1)) {
					await ns.gang.setMemberTask(members[a], "Vigilante Justice");
					ns.print(`    setting ${members[a]} to Vigilante Justice`);
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
					recruitedLastRound = true;
					members = ns.gang.getMemberNames();
					newMember = names[a];
					let newMemberObj = createMemberObject(ns, newMember);
					myGang[newMember] = newMemberObj;
					ns.print("Added gang member " + newMember);
					await ns.gang.setMemberTask(newMember, "Train Combat");
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
			ns.print(`setting ${members[a]} back to ${prevTasks[members[a]]}`);
			await ns.gang.setMemberTask(members[a], prevTasks[members[a]]);
		}
	}
}

async function evalMemberTasks(ns) {
	let members = ns.gang.getMemberNames();
	var thisMemberInfo = null;
	let proceedDescDeets = chooseOrder(ns);
	let start = proceedDescDeets[0];
	let end = proceedDescDeets[1];
	let proceedDesc = proceedDescDeets[2];
	var originalJumpLevels = [["Train Combat", 90], ["Mug People", 130], ["Strongarm Civilians", 300], ["Human Trafficking", 400], ["Terrorism", 1000000]];
	ns.print("Re-evaluating member tasks for harder tasks");
	let membersInWarfare = 0;
	let membersAtTerror = 0;
	for (var a = start; evalForOperation(proceedDesc, a, end); a = forOperation(proceedDesc, a)) {
		thisMemberInfo = ns.gang.getMemberInformation(members[a]);
		var destinationTask = "Territory Warfare";
		if (members.length >= 12) {
			jumpLevels = [["Train Combat", 250], ["Terrorism", 350], ["Territory Warfare", 600], ["Human Trafficking", 5900000]];
			if (ns.gang.getGangInformation().territory < 1 && await calculateWarChance(ns) < goToWarWhenChancesOver) {
				jumpLevels = [["Train Combat", 250], ["Terrorism", 350], ["Territory Warfare", 3500], ["Human Trafficking", 5900000]];
			}
			if (ns.getServerMoneyAvailable("home") > 10000000000) {
				if (endGameFocus == "Reputation") {
					jumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Terrorism", 99000000]];
				}
				if (endGameFocus == "Money") {
					if (ns.gang.getGangInformation().territory < 1) {
						jumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Territory Warfare", 99000000]];
					} else {
						jumpLevels = [["Train Combat", 300], ["Vigilante Justice", 350], ["Human Trafficking", 99000000]];
					}
				}
			}
		}
		if (members.length == 12 && membersInWarfare >= maximumFullGangAtWar) {
			jumpLevels = originalJumpLevels;
		}
		if (members.length == 12 && membersAtTerror < minimumFullGangTerror) {
			ns.gang.setMemberTask(members[a], "Territory Warfare");
			membersAtTerror++;
			continue;
		}
		for (let JL in jumpLevels) {
			if (thisMemberInfo.str > jumpLevels[JL][1]) {
				if (verbose) ns.print(`evaluating ${members[a]} str ${thisMemberInfo.str} > ${jumpLevels[JL][1]} JL=${JL}`);
				continue;
			} else {
				if (verbose) ns.print(`evaluating ${members[a]} str ${thisMemberInfo.str} <= ${jumpLevels[JL][1]} JL=${JL} so setting destinationTask= ${jumpLevels[JL][0]}`);
				destinationTask = jumpLevels[JL][0];
				break;
			}
		}
		if (members.length >= 12) {
			if ((members[a] == 'shawn') && thisMemberInfo.str > 1000) {
				ns.print(` Forcing ${members[a]} to Territory Warfare`);
				ns.gang.setMemberTask(members[a], "Territory Warfare");
				membersInWarfare++;
				break;
			}
		}
		if (destinationTask == "Territory Warfare") {
			membersInWarfare++;
		}
		if (destinationTask == "Terrorism") {
			membersAtTerror++;
		}
		if (thisMemberInfo.task != destinationTask) {
			ns.print(` Upgrading ${members[a]} from ${thisMemberInfo.task} to ${destinationTask}`);
			ns.gang.setMemberTask(members[a], destinationTask);
		}
	}
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
	let proceedDescDeets = chooseOrder(ns);
	let start = proceedDescDeets[0];
	let end = proceedDescDeets[1];
	let proceedDesc = proceedDescDeets[2];
	for (const equip of equipmentList) {
		for (var a = start; evalForOperation(proceedDesc, a, end); a = forOperation(proceedDesc, a)) {
			thisMemberInfo = ns.gang.getMemberInformation(members[a]);
			if (!thisMemberInfo.upgrades.includes(equip)) {
				if (ns.getServerMoneyAvailable("home") > ns.gang.getEquipmentCost(equip)) {
					ns.print(` Buying ${equip} for ${members[a]}`);
					ns.gang.purchaseEquipment(members[a], equip);
					myGang[members[a]].equipemntCostSinceAscention += ns.gang.getEquipmentCost(equip);
				}
			}

		}
	}
}

async function evalMemberAscend(ns) {
	var thisMemberInfo = null;
	let members = ns.gang.getMemberNames();
	ns.print("Evaluating members for ascention");
	var allowedAscendCount = Math.floor(members.length / 2);
	var ascendCounter = 0;
	let gangInfo = ns.gang.getGangInformation();
	let respectLeft = Math.floor(gangInfo.respect / 2);
	let proceedDescDeets = chooseOrder(ns);
	let start = proceedDescDeets[0];
	let end = proceedDescDeets[1];
	let proceedDesc = proceedDescDeets[2];
	for (var a = start; evalForOperation(proceedDesc, a, end); a = forOperation(proceedDesc, a)) {
		//var ascend = false;
		thisMemberInfo = ns.gang.getMemberInformation(members[a]);
		if (thisMemberInfo.earnedRespect == undefined) {
			thisMemberInfo.earnedRespect = 0;
		}
		var ascendPotentional = ns.gang.getAscensionResult(members[a]);
		if (ascendPotentional !== null && ascendPotentional !== undefined) {
			if ((gangInfo.respect - thisMemberInfo.earnedRespect) > gangInfo.wantedLevel) {
				if ((ascendPotentional.str > ascentionStatReqs.strength || ascendPotentional.dex > ascentionStatReqs.dexterity || ascendPotentional.agi > ascentionStatReqs.agility)) {
					if (!ns.gang.getGangInformation().territoryWarfareEngaged || ascendCounter <= maxMembersToAscendDuringWar) {
						let timeSinceAscention = Date.now() - myGang[members[a]].lastAscended;
						if ((timeSinceAscention >= timeToHoldOffOnAscentionAfterEquipping && myGang[members[a]].equipemntCostSinceAscention <= costOfEquipmentToPauseAscention)
							|| timeSinceAscention >= maxTimeBetweenAscention) {
							ns.print(` Ascending ${members[a]}`);
							await ns.gang.ascendMember(members[a]);
							await ns.sleep(150);
							gangInfo = ns.gang.getGangInformation();
							respectLeft = respectLeft - ascendPotentional.respect;
							ascendCounter++;
							myGang[members[a]].lastAscended = Date.now();
							myGang[members[a]].equipemntCostSinceAscention = 0;
						} else {
							if (verbose) ns.print(` Did NOT ascend ${members[a]} because of Equipment Purchase Timing`);
						}
					} else {
						if (verbose) ns.print(` ascending ${members[a]} would incur too much loss on Gang rep during war`);
					}
				} else {

					if (verbose) ns.print(` ${members[a]} not ready for Ascention`);
				}
			} else {
				if (verbose) ns.print(` ascending ${members[a]} would drop gang rep below wanted level.\n\t${gangInfo.respect} - ${thisMemberInfo.earnedRespect} > ${gangInfo.wantedLevel}`);
			}
		} else if (verbose) ns.print(` no ascention potential for ${members[a]}`);
	}
}
function chooseOrder(ns) {
	let members = ns.gang.getMemberNames();
	let proceedDesc = Math.random() < 0.5;
	let start = 0;
	let end = members.length;
	if (proceedDesc) {
		if (verbose) ns.print("  by descending order");
		start = members.length - 1;
		end = 0;
	} else {
		if (verbose) ns.print("  by ascending order");
	}
	return [start, end, proceedDesc];
}

function forOperation(desc, value) {
	if (desc) {
		return --value;
	} else {
		return ++value;
	}
}
function evalForOperation(desc, value, value2) {
	if (desc) {
		return value > value2;
	} else {
		return value < value2;
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
			ns.print(` Enabling Territory Warfare: Our worstcase chance ${lowestChance.toLocaleString('en-US')} Threshold: ${threshold}`);
			ns.gang.setTerritoryWarfare(true);
		}
	} else {
		ns.print(` Disabling Territory Warfare: Our worstcase chance ${lowestChance.toLocaleString('en-US')} Threshold: ${threshold}`);
		ns.gang.setTerritoryWarfare(false);
	}
}
function createMemberObject(ns, memberName) {
	let member = {};
	member.name = memberName;
	member.lastAscended = 0;
	member.equipemntCostSinceAscention = 0;
	return member;
}