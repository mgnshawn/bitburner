import {drawLCol} from '/terminal.js';
const baseUrl = 'https://raw.githubusercontent.com/mgnshawn/bitburner/master/';
const filesToDownload = [
  'bitburner.js','crimeItUp.js','spiderHackBuy.js','hackit.js','manageGang.js','factionUpAugs.js','helpers.js','ioHelpers.js','terminal.js'
];
const initialCombatStatsToGym = {'strength':10,'dexterity':10,'agility':10};
var doDownload = true;
export async function main(ns) {
  if(ns.args[0] !== undefined && ns.args[0] == 'nodownload') {
    doDownload= false;
  }
  ns.tail();
  let hostname = ns.getHostname();
  let switchToCrimeAt = 1.8;
  if (hostname !== 'home') {
    throw new Exception('Run the script from home');
  }
  if(doDownload) {
  for (let i = 0; i < filesToDownload.length; i++) {
    const filename = filesToDownload[i];
    const path = baseUrl + filename;
    await ns.scriptKill(filename, 'home');
    await ns.rm(filename);
    await ns.sleep(200);
    ns.tprint(`Trying to download ${path}`);
    await ns.wget(path + '?ts=' + new Date().getTime(), filename);
  }
  }
  /*if(ns.getPlayer()["hacking_mult"] < switchToCrimeAt) {
    await ns.run('factionUp.js');
  } else {
    await ns.run('crimeItUp.js',1,"auto",'-l');
  }*/
  ns.run('terminal.js');
  for(let x = 0; x < Object.keys(initialCombatStatsToGym); x++) {
    let stat = Object.keys(initialCombatStatsToGym)[x];
    let statTarget = initialCombatStatsToGym[stat];
	  let workingOut = false;
	  do {
		  if(!workingOut) {
        ns.print(drawLCol(`Training up ${stat} from ${ns.getPlayer()[stat]} to ${statTarget}`));
		    let tried = ns.gymWorkout('powerhouse gym', stat);
		    if(tried)
		      workingOut = true;
		  }
			await ns.sleep(1000);
	  } while(ns.getPlayer().strength <= statTarget);
	  ns.stopAction();
  }
  await ns.sleep(1000);
  await ns.run('factionUpAugs.js');
  if(ns.heart.break() < -40000) {
    await ns.run('manageGang.js');
  }
  await ns.run('spiderHackBuy.ns', 1, "ram", 8, "slice", 16,"target", "auto");
}