const baseUrl = 'https://raw.githubusercontent.com/mgnshawn/bitburner/master/';
const filesToDownload = [
  'bitburner.js','crimeItUp.js','go.js','hackit.js','manageGang.js','factionUp.js'
];

export async function main(ns) {

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
  if(ns.getPlayer()["hacking_mult"] < switchToCrimeAt) {
    await ns.run('factionUp.ns');
  } else {
    await ns.run('crimeItUp.ns',1,"auto",'-l');
  }
  let targetInfo = chooseTarget(ns.getPlayer()["hacking"]);
    ns.run('manageGang.ns');
  ns.spawn('go.ns', 1, 16, targetInfo["slice"], targetInfo["target"], "n", "v", "initial");
}

export function chooseTarget(hackingLevel) {
  let resp = {};
  if( hackingLevel < 100) {
    resp = {"target":"n00dles","slice":1,"rungGang":false};
  } else if(100 <= hackingLevel && hackingLevel < 300) {
    resp = {"target":"joesguns","slice":4,"rungGang":false};
  } else if ( 300 <= hackingLevel && hackingLevel < 1000) {
    resp = {"target":"iron-gym","slice":8,"runGang":true};
  } else if ( 1000 <= hackingLevel && hackingLevel < 1350) {
    resp = {"target":"catalyst","slice":16,"runGang":true};
  } else {
    resp = {"target":"megacorp","slice":60,"runGang":true};
  }
  return resp;
}