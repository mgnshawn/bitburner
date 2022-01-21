import { drawLCol, drawStatus1, drawList1, drawDoing, primeExistingBufferLists, clearLCol, clearStatusList, clearList1, clearDoingLine } from '/terminal.js';
import { getItem, setItem, resetLocks } from '/_helpers/ioHelpers.js';
const baseUrl = 'https://raw.githubusercontent.com/mgnshawn/bitburner/master/';
export async function main(ns) {
var doDownload = false;
const initialCombatStatsToGym = { 'strength': 10, 'dexterity': 10, 'agility': 10 };
  primeExistingBufferLists(ns);
  clearLCol(ns);
  clearStatusList(ns);
  clearList1(ns);
  clearDoingLine(ns);
  for(let arg in ns.args) {
    if( ns.args[arg] == "download") {
      doDownload = true;
    }
    if( ns.args[arg] == "reset") {
      localStorage.clear();
    }
    if (ns.args[arg] == "fullstart") {
      fullStart(ns,doDownload,initialCombatStatsToGym);
    }
  }
}
async function fullStart(ns,doDownload,initialCombatStatsToGym) {
  ns.disableLog('sleep');
  ns.tail();
  let hostname = ns.getHostname();
  let switchToCrimeAt = 1.8;
  if (hostname !== 'home') {
    throw new Exception('Run the script from home');
  }
  if (doDownload) {
    await ns.run('/_helpers/download.js');
    ns.sleep(10000);
  }
  /*if(ns.getPlayer()["hacking_mult"] < switchToCrimeAt) {
    await ns.run('factionUp.js');
  } else {
    await ns.run('crimeItUp.js',1,"auto",'-l');
  }*/
  ns.run('/_helpers/terminal.js');
  await ns.sleep(1000);
  await ns.run('factionUpAugs.js', 1, 'autowork');
  if (ns.heart.break() < -40000) {
    await ns.run('manageGang.js');
    await ns.sleep(1000);
  }
  await ns.sleep(1000);
  await ns.run('spiderHackBuy.js', 1, "ram", 8, "slice", 16, "target", "auto");
  await ns.sleep(1000);
  do {
    await ns.sleep(30000);
    drawStatus1(ns, "Waiting for owned srv > 1 to proceed");
  } while (ns.getPurchasedServers().length <= 1)

  drawStatus1(ns, "Exercising up combat stats to 10");
  for (let x = 0; x < Object.keys(initialCombatStatsToGym).length; x++) {
    let stat = Object.keys(initialCombatStatsToGym)[x];

    let statTarget = initialCombatStatsToGym[stat];
    let workingOut = false;

    do {
      if (!workingOut) {
        ns.print(drawLCol(`Training up ${stat} from ${ns.getPlayer()[stat]} to ${statTarget}`));
        let tried = ns.gymWorkout('powerhouse gym', stat);
        if (tried)
          workingOut = true;
      }
      await ns.sleep(1000);
    } while (ns.getPlayer()[stat] <= statTarget);
    ns.stopAction();
  }
  await ns.run('crimeItUp.js', 1, 'auto', 'l');
  /*drawStatus1(ns, "Beginning crimeItUp for cash until 10 servers owned");
  do {
    await ns.sleep(60000);
    drawStatus1(ns, "Waiting for owned srv >= 10 to proceed");
  } while (ns.getPurchasedServers().length <= 10)*/
}