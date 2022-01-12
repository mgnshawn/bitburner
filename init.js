const baseUrl = 'https://raw.githubusercontent.com/mgnshawn/bitburner/master/';
const filesToDownload = [
  'bitburner.js','crimeItUp.js','spiderHackBuy.js','hackit.js','manageGang.js','factionUpAugs.js','helpers.js','ioHelpers.js'
];

export async function main(ns) {
  ns.tail();
  let hostname = ns.getHostname();
  let switchToCrimeAt = 1.8;
  if (hostname !== 'home') {
    throw new Exception('Run the script from home');
  }

  for (let i = 0; i < filesToDownload.length; i++) {
    const filename = filesToDownload[i];
    const path = baseUrl + filename;
    await ns.scriptKill(filename, 'home');
    await ns.rm(filename);
    await ns.sleep(200);
    ns.tprint(`Trying to download ${path}`);
    await ns.wget(path + '?ts=' + new Date().getTime(), filename);
  }
  /*if(ns.getPlayer()["hacking_mult"] < switchToCrimeAt) {
    await ns.run('factionUp.js');
  } else {
    await ns.run('crimeItUp.js',1,"auto",'-l');
  }*/
  await ns.run('factionUpAugs.js');
  await ns.run('manageGang.js');
  let targetInfo = chooseTarget(ns.getPlayer()["hacking"]);

  await ns.run('spiderHackBuy.ns', 1, "ram", 16, "slice", targetInfo["slice"],"target", "auto");
}

export function chooseTarget(hackingLevel) {
  let resp = {};
  if( hackingLevel < 100) {
    resp = {"target":"n00dles","slice":1,"rungGang":false};
  } else if(100 <= hackingLevel && hackingLevel < 350) {
    resp = {"target":"joesguns","slice":4,"rungGang":false};
  } else if ( 350 <= hackingLevel && hackingLevel < 1000) {
    resp = {"target":"iron-gym","slice":8,"runGang":true};
  } else if ( 1000 <= hackingLevel && hackingLevel < 1350) {
    resp = {"target":"catalyst","slice":16,"runGang":true};
  } else {
    resp = {"target":"megacorp","slice":60,"runGang":true};
  }
  return resp;
}