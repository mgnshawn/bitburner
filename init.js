import {drawLCol, drawStatus1, drawList1, drawDoing,primeExistingBufferLists, clearLCol, clearStatusList, clearList1, clearDoingLine } from '/terminal.js';
const baseUrl = 'https://raw.githubusercontent.com/mgnshawn/bitburner/master/';
const initialCombatStatsToGym = {'strength':10,'dexterity':10,'agility':10};
var doDownload = true;
export async function main(ns) {
		primeExistingBufferLists(ns);
		clearLCol(ns);
		clearStatusList(ns);
		clearList1(ns);
	clearDoingLine(ns);
  if(ns.args[0] !== undefined && ns.args[0] == 'nodownload') {
    doDownload= false;
  }
  ns.disableLog('sleep');
  ns.tail();
  let hostname = ns.getHostname();
  let switchToCrimeAt = 1.8;
  if (hostname !== 'home') {
    throw new Exception('Run the script from home');
  }
  if(doDownload) {
   await ns.run('download.js');
  }
  /*if(ns.getPlayer()["hacking_mult"] < switchToCrimeAt) {
    await ns.run('factionUp.js');
  } else {
    await ns.run('crimeItUp.js',1,"auto",'-l');
  }*/
  ns.run('terminal.js');
  await ns.run('spiderHackBuy.js', 1, "ram", 8, "slice", 16,"target", "auto");
  do {
    await ns.sleep(30000);
    drawStatus1(ns, "Waiting for owned srv > 1 to proceed");
  } while (ns.getPurchasedServers().length <= 1)

  drawStatus1(ns, "Exercising up combat stats to 10");
  for(let x = 0; x < Object.keys(initialCombatStatsToGym).length; x++) {
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
	  } while(ns.getPlayer()[stat] <= statTarget);
	  ns.stopAction();
  }
  drawStatus1(ns, "Beginning crimeItUp for cash until 10 servers owned");
  do {
    await ns.sleep(60000);
    drawStatus1(ns, "Waiting for owned srv >= 10 to proceed");
  } while (ns.getPurchasedServers().length <= 10)
  await ns.sleep(1000);
  await ns.run('factionUpAugs.js');
  if(ns.heart.break() < -40000) {
    await ns.run('manageGang.js');
  }
}
