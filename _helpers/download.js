const baseUrl = 'https://raw.githubusercontent.com/mgnshawn/bitburner/master/';
const filesToDownload = [
  'bitburner.js','init.js','goto.js','singleDownload.js',
  'crimeItUp.js','lite_crimeItUp.js',
  'spiderHackBuy.js','lite_spiderHackBuy.js',
  'hackit.js','manageGang.js','factionUpAugs.js',
  'helpers.js','ioHelpers.js','terminal.js'
];
const _scriptRamHelpers = [
  '_installBackdoor.js','_connect.js','_getPurchasedPrograms.js','_purchaseTor.js','_purchaseProgram.js','_getCurrentServer.js'
];
var doDownload = true;
export async function main(ns) {
  let hostname = ns.getHostname();
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
    ns.print(`Trying to download ${path}`);
    await ns.wget(path + '?ts=' + new Date().getTime(), filename);
  }
  ns.sleep(2000);
  for (let i = 0; i < _scriptRamHelpers.length; i++) {
    const filename = '_scriptRamHelpers/'+filesToDownload[i];
    const path = baseUrl + filename;
    await ns.scriptKill(filename, 'home');
    await ns.rm(filename);
    await ns.sleep(200);
    ns.print(`Trying to download ${path}`);
    await ns.wget(path + '?ts=' + new Date().getTime(), filename);
    await ns.sleep(1000);
    ns.mv('home',`/${filename}`,`/_scriptRamHelpers/${filename}`);
    await ns.sleep(50);
  }
  }
}