import { drawList1, drawStatus1, drawLCol, clearLCol } from '/terminal.js';
import { scan, findServerPath, money, chooseTarget, travelToServer, travelBackHome } from '/_helpers/helpers.js';
import { getItem, setItem, getLockAndUpdate } from '/_helpers/ioHelpers.js';


var ownedServers = { 'home': 'home' };
var autoJoinServerFactions = true;
var highestLevelSeen = 1;
var scriptRam = 0;
var purchaseServers = false;
var ram = 0;
var forceUpdate = true;
var crackers = 0;
var networkMap = { 'home': {} };
var contractsFound = [];
var onlyHunting = false;
var designateTarget = false;
var quiet = true;
var autoTarget = false;
var memmoryLevels = [8, 32, 256, 1024, 2048, 4096, 32768, (128 * 1024), (512 * 1024), (1024 * 1024)];
var serversOnTarget = {};
const timeBetweenUpgradeLoops = .1 * 60 * 1000;
const timeBetweenNewPurchaseAndUpgradeLoop = .05 * 60 * 1000;


export async function main(ns) {

    quiet = true;
    ns.disableLog('disableLog');
    ns.disableLog('sleep');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('getServerRequiredHackingLevel');
    ns.disableLog('getScriptRam');
    ns.disableLog('getPlayer');
    ns.disableLog('getPurchasedServers');
    ns.disableLog('getPurchasedServerLimit');
    ns.disableLog('getServerNumPortsRequired');
    ns.disableLog('deleteServer');
    ns.disableLog('purchaseServer');
    ns.disableLog('scan');
    ns.disableLog('exec');
    ns.disableLog('run');
    ns.disableLog('scp');
    ns.disableLog('brutessh');
    ns.disableLog('ftpcrack');
    ns.disableLog('relaysmtp');
    ns.disableLog('httpworm');
    ns.disableLog('sqlinject');
    ns.disableLog('nuke');
    for (let z = 0; z < ns.args.length; z++) {
        if (ns.args[z] !== undefined) {
            if (ns.args[z] == "-h" || ns.args[z] == "-?" || ns.args[z] == "?" || ns.args[z] == "h") {
                await ns.tprint("spiderHackBuy.js fullauto ||  Req:(ram nopurchase||Ram in GB)   (target self||auto||target name) (forceupdate) (v verbose) ");
                await ns.tprint("Options:Purchase servers     This can run against net servers only or also buy player owned. If buying, specify the starting ram in GB, it will continue to evolve the servers size once the max has been purchased.");
                await ns.tprint("Options:Designate Target     Designate a server all conquered servers should attack, if not designated then conquered servers will be set to target themselves.");
                await ns.tprint("Options:Only Hunting    This only spiders the net for contract files or the-cave. All locations of contracts will be written to found.contracts");
                await ns.tprint("The app will discover the network and attempt to conquer any server below your level that you have appropriate crackers for. It will continue this loop as you continue to level up. It will also make sure all your owned servers are running the /_helpers/hackit.js script at full levels starting with home. If set to purchase servers, it will purchase servers at the memory level specified. Once 25 servers have been purchased it will recycle the oldest and purchase a server at the next memory size.");
                ns.exit();
            }
            if (ns.args[z] == 'v') {
                quiet = false;
            }
            if (ns.args[z] == 'ram' && ns.args[z + 1] != undefined && !isNaN(ns.args[z + 1])) {
                ram = ns.args[z + 1];
                purchaseServers = true;
            }
            if (ns.args[z] == 'target' && ns.args[z + 1] != undefined) {
                if (ns.args[z + 1] == "auto") {
                    designateTarget = true;
                    autoTarget = true;
                    var target = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["target"];
                    ram = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["ram"];
                    ns.print(`Target Chosen: ${target} purchase level set ${ram}gb`);
                } else {
                    designateTarget = true;
                    var target = ns.args[z + 1];
                }
            }
        }
    }
    ns.tail();
    serversOnTarget = getItem(ns, 'serversOnTarget');
    if (serversOnTarget == undefined) {
        await getLockAndUpdate(ns, 'serversOnTarget', {});
    }
    await ns.sleep(1000);
    ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
    await ns.sleep(3000);


    if (ns.fileExists("BruteSSH.exe"))
        crackers++;
    if (ns.fileExists("FTPCrack.exe"))
        crackers++;
    if (ns.fileExists("relaySMTP.exe"))
        crackers++;
    if (ns.fileExists("HTTPWorm.exe"))
        crackers++;
    if (ns.fileExists("SQLInject.exe"))
        crackers++;




    if (!quiet) await ns.print(`Cost to purchase this servers with ${money(ram)}gb: $${Math.round(ns.getPurchasedServerCost(ram)).toLocaleString('en-US')}`);
    drawLCol(`Cost to purchase this servers with ${money(ram)}gb: $${Math.round(ns.getPurchasedServerCost(ram)).toLocaleString('en-US')}`);

    await checkForApps(ns);
    crackers = 0;
    if (ns.fileExists("BruteSSH.exe"))
        crackers++;
    if (ns.fileExists("FTPCrack.exe"))
        crackers++;
    if (ns.fileExists("relaySMTP.exe"))
        crackers++;
    if (ns.fileExists("HTTPWorm.exe"))
        crackers++;
    if (ns.fileExists("SQLInject.exe"))
        crackers++;

    var servers = getItem(ns, 'purchasedServers');

    await ns.sleep(1000);
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        for (var a = 0; a < ns.getPurchasedServerLimit(); a++) {
            if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
                if (servers[a] !== undefined && ns.serverExists(servers[a]))
                    if (ns.getServerMaxRam(servers[a]) < ram) {
                        if (!quiet) await ns.print("Upgrading " + servers[a] + " from " + ns.getServerMaxRam(servers[a]) + " to " + ram);
                        var skillSuck = ns.scriptKill("/_helpers/hackitManager.js", servers[a]);
                        var skillSuck = ns.scriptKill("/_helpers/hackit_hack.js", servers[a]);
                        var skillSuck = ns.scriptKill("/_helpers/hackit_grow.js", servers[a]);
                        var skillSuck = ns.scriptKill("/_helpers/hackit_weaken.js", servers[a]);
                        var delSuc = ns.deleteServer(servers[a]);
                        if (delSuc == true) {
                            if (!quiet) await ns.print(" Deleted " + servers[a]);
                        } else {
                            if (!quiet) await ns.print("  Problem Deleting " + servers[a]);
                        }
                        var hostname = `attack-server-${ram}gb-`;
                        ns.purchaseServer(hostname, ram);
                        await ns.sleep(1000);
                        if (ns.serverExists(hostname)) {
                            checkForApps(ns);
                            if (!quiet) await ns.print(" Purchased " + hostname);
                            ns.print(`Recycled [${servers[a]}] into [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
                            drawLCol(ns, `Recycled [${servers[a]}] into [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);

                            await startHacking(ns, hostname, target);
                        }
                    }
            }
        }
    } else {
        ns.tprint(`Not enough money, need $${money(ns.getPurchasedServerCost(ram))}`);
    }
}





async function startHacking(ns, serv, thisTarget) {
    let serverDetails = { target: 'NotYetSet', forceUpdated: false };

    if (serversOnTarget[serv] !== undefined) {
        serverDetails = serversOnTarget[serv];
    } else {
        serversOnTarget[serv] = serverDetails;
    }
    if (serv != 'home') {
        if (!ns.fileExists("/_helpers/hackitManager.js", serv)) {
            await ns.scp("/_helpers/hackitManager.js", serv);
            await ns.scp(["/_helpers/hackit_hack.js", "/_helpers/hackit_grow.js", "/_helpers/hackit_weaken.js", "/_helpers/ioHelpers.js"], serv);
        }
        if (forceUpdate && serverDetails.forceUpdated == false) {
            ns.scriptKill('/_helpers/hackitManager.js', serv);
            ns.scriptKill('/_helpers/hackit_hack.js', serv);
            ns.scriptKill('/_helpers/hackit_grow.js', serv);
            ns.scriptKill('/_helpers/hackit_weaken.js', serv);
            await ns.sleep(1000);
            await ns.scp("/_helpers/hackitManager.js", serv);
            await ns.scp(["/_helpers/hackit_hack.js", "/_helpers/hackit_grow.js", "/_helpers/hackit_weaken.js", "/_helpers/ioHelpers.js"], serv);
            serverDetails.forceUpdated = true;
        }
    }
    let startedNewThreads = true;

    if (!ns.scriptRunning('/_helpers/hackitManager.js', serv) || serverDetails.target != thisTarget) {
        if (serverDetails.target != thisTarget && serverDetails.target != 'notenoughram') {
            ns.print(`Killing running threads on ${serv}. Target:${serverDetails.target} != NewTarget:${thisTarget}`);
            await ns.scriptKill('/_helpers/hackitManager.js', serv);
            await ns.sleep(250);
            await ns.scriptKill('/_helpers/hackit_hack.js', serv);
            await ns.sleep(250);
            await ns.scriptKill('/_helpers/hackit_grow.js', serv);
            await ns.sleep(250);
            await ns.scriptKill('/_helpers/hackit_weaken.js', serv);
            await ns.sleep(2000);
        }
        if ((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) < (ns.getScriptRam('/_helpers/hackitManager.js') + ns.getScriptRam('/_helpers/hackit_grow.js'))) {
            let serverInfo = { target: 'notenoughram', forceUpdated: false };
            if (serversOnTarget[serv] == undefined) {
                serversOnTarget[serv] = serverInfo;
            } else {
                serverInfo = serversOnTarget[serv];
            }
            if (serverInfo.target != 'notenoughram') {
                ns.print(`Not enough ram on ${serv} to start hackitManager`);
                serversOnTarget[serv].target = 'notenoughram';
            }
            return;
        }
        if (serv == 'home') {
            await ns.run('/_helpers/hackitManager.js', 1, thisTarget, serv);
        } else {
            await ns.exec('/_helpers/hackitManager.js', serv, 1, thisTarget, serv);
            serverDetails.target = thisTarget;
        }
        ns.print(`Started /_helpers/hackitManager.js on [${serv}] attacking [${thisTarget}]`);
        drawLCol(ns, `Started /_helpers/hackitManager.js on [${serv}] attacking [${thisTarget}]`);
        serversOnTarget[serv] = serverDetails;
        await getLockAndUpdate(ns, 'serversOnTarget', serversOnTarget);
    }
}

async function checkForApps(ns) {
    if (ns.getPlayer()["tor"] == false && ns.getServerMoneyAvailable("home") >= 200000) {
        ns.run('/_scriptRamHelpers/_purchaseTor.js');
        ns.toast("Bought Tor");
        await ns.sleep(1000);
    }

    if (!ns.fileExists("BruteSSH.exe", 'home') && ns.getServerMoneyAvailable("home") >= 500000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js', 1, "BruteSSH.exe");
        ns.toast("Bought BruteSSH");
    }
    if (!ns.fileExists("FTPCrack.exe", 'home') && ns.getServerMoneyAvailable("home") >= 1500000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js', 1, "FTPCrack.exe");
        ns.toast("Bought FTPCrack");
    }
    if (ns.getPlayer().hacking >= 300 && !ns.fileExists("relaySMTP.exe", 'home') && ns.getServerMoneyAvailable("home") >= 5000000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js', 1, "relaySMTP.exe");
        ns.toast("Bought relaySMTP");
    }
    if (ns.getPlayer().hacking >= 400 & !ns.fileExists("AutoLink.exe", 'home') && ns.getServerMoneyAvailable("home") >= 1500000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js', 1, "AutoLink.exe");
        ns.toast("Bought AutoLink");
    }
    if (!ns.fileExists("HTTPWorm.exe", 'home') && ns.getServerMoneyAvailable("home") >= 30000000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js', 1, "HTTPWorm.exe");
        ns.toast("Bought HTTPWorm");
    }
    if (!ns.fileExists("SQLInject.exe", 'home') && ns.getServerMoneyAvailable("home") >= 250000000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js', 1, "SQLInject.exe");
        ns.toast("Bought SQLInject");
    }
    crackers = 0;
    if (ns.fileExists("BruteSSH.exe", 'home'))
        crackers++;
    if (ns.fileExists("FTPCrack.exe", 'home'))
        crackers++;
    if (ns.fileExists("relaySMTP.exe", 'home'))
        crackers++;
    if (ns.fileExists("HTTPWorm.exe", 'home'))
        crackers++;
    if (ns.fileExists("SQLInject.exe", 'home'))
        crackers++;
}