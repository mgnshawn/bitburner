import { drawList1, drawStatus1, drawLCol, clearLCol } from '/_helpers/terminal.js';
import { scan, findServerPath, money, chooseTarget, travelToServer, travelBackHome } from '/_helpers/helpers.js';
import { getItem, setItem, getLockAndUpdate } from '/_helpers/ioHelpers.js';


var ownedServers = { 'home': 'home' };
var autoJoinServerFactions = true;
var highestLevelSeen = 1;
var purchaseServers = false;
var ram = 0;
var forceUpdate = false;
var crackers = 0;
var contractsFound = [];
var quiet = true;
var autoTarget = false;
var memmoryLevels = [8, 32, 256, 1024, 2048, 4096, 32768, (128 * 1024), (512 * 1024), (1024 * 1024)];
var serversOnTarget = {};
var includeHome;
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
    var target = 'n00dles';
    if (!ns.scriptRunning('/_schedules/schedule_openPorts.js', 'home')) {
        await ns.run('/_schedules/schedule_openPorts.js');
        await ns.sleep(5000);
    }
    ns.print("======================== Beginning Go Hack ========================");
    clearLCol(ns);
    drawLCol(ns, "======================== Beginning Go Hack ========================");
    ns.print(drawLCol(ns, `Largest Server Allowed ${money(ns.getPurchasedServerMaxRam())} gb`));
    ns.print(drawLCol(ns, `Maximum Servers Allowed ${ns.getPurchasedServerLimit()}`));
    for (let z = 0; z < ns.args.length; z++) {
        if (ns.args[z] !== undefined) {
            if (ns.args[z] == "-h" || ns.args[z] == "-?" || ns.args[z] == "?" || ns.args[z] == "h") {
                await ns.tprint("spiderHackBuy.js fullauto ||  Req:(ram nopurchase||Ram in GB)   (target self||auto||target name) (forceupdate) (v verbose) ");
                await ns.tprint("Options:Purchase servers     This can run against net servers only or also buy player owned. If buying, specify the starting ram in GB, it will continue to evolve the servers size once the max has been purchased.");
                await ns.tprint("The app will discover the network and attempt to conquer any server below your level that you have appropriate crackers for. It will continue this loop as you continue to level up. It will also make sure all your owned servers are running the /_helpers/hackit.js script at full levels starting with home. If set to purchase servers, it will purchase servers at the memory level specified. Once 25 servers have been purchased it will recycle the oldest and purchase a server at the next memory size.");
                ns.exit();
            }
            if (ns.args[z] == 'v') {
                quiet = false;
            }
            if (ns.args[z] == 'forceupdate') {
                forceUpdate = true;
            }
            if (ns.args[z] == 'nopurchase') {
                purchaseServers = false;
                ram == 0;
            }
            if (ns.args[z] == 'includehome') {
                includeHome = true;
            }
            if (ns.args[z] !== undefined && ns.args[0] == "fullauto") {
                autoTarget = true;
                var target = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["target"];
                ram = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["ram"];
                ns.print(`Target Chosen: ${target} purchase level set ${ram}gb`);
            }
            if (ns.args[z] == 'findserver' && ns.args[z + 1] != undefined) {
                let foundServers = await scan(ns);
                var searchTarget = ns.args[z + 1];
                let pathToTarget = await findServerPath(ns, searchTarget);
                ns.tprint(pathToTarget);
                ns.exit();
            }
            if (ns.args[z] == 'ram' && ns.args[z + 1] != undefined && !isNaN(ns.args[z + 1])) {
                ram = ns.args[z + 1];
                purchaseServers = true;
            }
            if (ns.args[z] == 'target' && ns.args[z + 1] != undefined) {
                if (ns.args[z + 1] == "auto") {
                    autoTarget = true;
                    target = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["target"];
                    ram = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["ram"];
                    ns.print(`Target Chosen: ${target} purchase level set ${ram}gb`);
                } else {
                    var target = ns.args[z + 1];
                }
            }
        }
    }
    ns.tail();
    ns.print("Resetting serversOnTarget .forceUpdated status");
    serversOnTarget = getItem(ns, 'serversOnTarget');
    if (serversOnTarget == undefined) {
        await getLockAndUpdate(ns, 'serversOnTarget', {});
    }
    if (serversOnTarget !== undefined) {
        for (let serv of Object.keys(serversOnTarget)) {
            ns.print(`serv ${serv}`);
            let serverDetails = { target: 'NotYetSet', forceUpdated: false };
            if (serversOnTarget[serv] !== undefined) {
                serverDetails = serversOnTarget[serv];
            } else {
                serversOnTarget[serv] = serverDetails;
            }
            serversOnTarget[serv].forceUpdated = false;
        }
        await getLockAndUpdate(ns, 'serversOnTarget', serversOnTarget);
    } else {
        setItem(ns, 'serversOnTarget', {});
    }



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


    if (purchaseServers) {
        if (!quiet) await ns.print(`Cost to purchase these servers with ${money(ram)}gb: $${Math.round(ns.getPurchasedServerCost(ram)).toLocaleString('en-US')}`);
        drawLCol(ns, `Cost to purchase these servers with ${money(ram)}gb: $${Math.round(ns.getPurchasedServerCost(ram)).toLocaleString('en-US')}`);
    }


    var serv = 'home';
    var rand = Math.random();

    ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
    await ns.sleep(3000);
    var attackServers = getItem(ns, 'purchasedServers');
    await ns.sleep(1000);
    if (includeHome) {

        if (!ns.scriptRunning('/_helpers/hackitManager.js', 'home')) {
            await startHacking(ns, 'home', target);
        }
    }
    // Make sure our servers are running optimal threads
    if (!quiet) await ns.print("Optimizing our purchased servers...");
    drawLCol(ns, "Optimizing our purchased servers...");
    for (var a = 0; a < attackServers.length; a++) {
        var hostname = attackServers[a];
        ns.print(`Initial attackServer starthacking ${hostname} ${target}`);
        await startHacking(ns, hostname, target);
    }
    if (purchaseServers == false) {
        ns.print("Spider and Hack Only!");
        if (autoTarget) {
            target = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["target"];
            await ns.sleep(100);
            if (lastTarget != target) {
                await ns.print(await drawLCol(ns, `AutoTarget:: RAM ${money(ram)}gb TARGET ${target}`));
                lastTarget = target;
            }
        }
        if (!quiet) ns.print("Spidering...");
        drawLCol(ns, "scanning for servers now in attack level...");
        await scanServer(ns, { 'home': 'home' }, target, 0);
        await ns.sleep(5000);
        ns.print("Done");
        ns.exit();

    }
    var i = 0;

    // Continuously try to purchase servers until we've reached the maximum
    ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
    await ns.sleep(250);
    var attackServers = getItem(ns, 'purchasedServers');
    if (purchaseServers == true && attackServers.length < ns.getPurchasedServerLimit()) {
        drawLCol(ns, "Beginning NEW server purchase loop");
    }
    var lastTarget = "";
    let scanEvery5loops = 0;
    while (purchaseServers == true && attackServers.length < ns.getPurchasedServerLimit()) {
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
        if (!quiet) ns.print("Spidering...");
        if (scanEvery5loops >= 5) {
            scanEvery5loops = 0;
        }
        if (scanEvery5loops == 0) {
            await scanServer(ns, { 'home': 'home' }, target, 0);
        }

        if (autoTarget) {
            target = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["target"];
            ram = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["ram"];
            await ns.sleep(100);
            if (lastTarget != target) {
                await ns.print(await drawLCol(ns, `AutoTarget:: RAM ${money(ram)}gb TARGET ${target} $${money(ns.getPurchasedServerCost(ram))}`));
                lastTarget = target;
            }
        }
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            var hostname = `attack-${target}-${ram}gb-${i}`;
            let hash = Math.random();
            ns.run('/_scriptRamHelpers/_purchaseServer.js', 1, hostname, ram, hash);
            await ns.sleep(5000);
            let newServerName = getItem(ns, `server_purchase_name_${hash}`);
            if (newServerName !== undefined) {
                hostname = newServerName;
                localStorage.removeItem(`server_purchase_name_${hash}`);
            }
            checkForApps(ns);
            ns.print(`Purchased [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
            drawLCol(ns, `Purchased [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
            await ns.sleep(4000);
            if (ns.serverExists(hostname)) {
                await startHacking(ns, hostname, target);
            }
        } else {
            ns.print(` ... need $${money(ns.getPurchasedServerCost(ram) - ns.getServerMoneyAvailable('home'))} more `);
        }
        await ns.sleep(timeBetweenNewPurchaseAndUpgradeLoop);
        ns.run('_scriptRamHelpers/_getPurchasedServers.js');
        await ns.sleep(100);
        attackServers = getItem(ns, 'purchasedServers');
        await ns.sleep(250);
        scanEvery5loops++;
    }

    if (!quiet) ns.print("Spidering...");
    drawLCol(ns, "scanning for servers now in attack level...");
    await scanServer(ns, { 'home': 'home' }, target, 0);

    ns.print("Moving on to upgrade loop in 10 minutes...");
    drawLCol(ns, "Moving on to upgrade loop in 10 minutes...");
    if (autoTarget) {
        target = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["target"];
        ram = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["ram"];
    }
    ns.print(drawLCol(ns, `Starting Upgrade Loop at ${money(ram)}gb @ $${money(ns.getPurchasedServerCost(ram))}`));

    while (purchaseServers == true && ram <= memmoryLevels[(memmoryLevels.length - 1)]) {
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
        if (autoTarget) {
            target = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["target"];
            ram = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["ram"];
        }
        var upgrade = true;
        ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
        await ns.sleep(250);
        var servers = getItem(ns, 'purchasedServers');
        await ns.sleep(100);
        if (!quiet) ns.print("Spidering...");
        await scanServer(ns, { 'home': 'home' }, target, 0);
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
                                upgrade = false;
                            } else {
                                if (!quiet) await ns.print("  Problem Deleting " + servers[a]);
                            }
                            var hostname = `attack-${target}-${ram}gb-${i}`;
                            let hash = Math.random();
                            ns.run('/_scriptRamHelpers/_purchaseServer.js', 1, hostname, ram, hash);
                            await ns.sleep(5000);
                            let newServerName = getItem(ns, `server_purchase_name_${hash}`);
                            if (newServerName !== undefined) {
                                hostname = newServerName;
                                localStorage.removeItem(`server_purchase_name_${hash}`);
                            }
                            if (ns.serverExists(hostname)) {
                                checkForApps(ns);
                                if (!quiet) await ns.print(" Purchased " + hostname);
                                ns.print(`Recycled [${servers[a]}] into [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
                                drawLCol(ns, `Recycled [${servers[a]}] into [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
                                await ns.sleep(5000);
                                await startHacking(ns, hostname, target);
                                ns.print("Next server cost $" + ns.getPurchasedServerCost(ram).toLocaleString('en-US'));
                                drawLCol(ns, "Next server cost $" + ns.getPurchasedServerCost(ram).toLocaleString('en-US'));
                            }
                        }
                } else {
                    if (!quiet) await ns.print("Not enough money to upgrade yet, need: $" + money(ns.getPurchasedServerCost(ram)));
                    await ns.sleep(Math.round(timeBetweenUpgradeLoops / 2));
                }
                ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
                await ns.sleep(250);
                servers = getItem(ns, 'purchasedServers');
                await ns.sleep(100);
                for (var a = 0; a < servers.length; a++) {
                    if (upgrade == false || ns.getServerMaxRam(servers[a]) < ram) {
                        upgrade = false;
                    }
                }

            }
            if (upgrade == true) {
                checkForApps(ns);
                ram = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["ram"];
                await ns.sleep(50000);
                await ns.print("-- Setting Upgrade Server Ram to " + money(ram));
                await ns.print("    New server cost: " + money(ns.getPurchasedServerCost(ram)));
                drawLCol(ns, "-- Setting Upgrade Server Ram to " + money(ram));
                drawLCol(ns, "    New server cost: " + money(ns.getPurchasedServerCost(ram)));
                upgrade = false;
            }
            await ns.sleep(timeBetweenUpgradeLoops);
        }
    }

    while (true) {
        await checkForApps(ns);
        if (!quiet) ns.print("Spidering...");
        drawLCol(ns, "scanning for servers now in attack level...");
        await scanServer(ns, { 'home': 'home' }, target, 0);
        await ns.sleep(60000);
    }
    ns.enableLog('sleep');
}



async function scanServer(ns, source, target, level) {
    level++;
    var spacer = "";
    for (var sp = 0; sp < level; sp++) {
        spacer = spacer + " ";
    }
    let files = ns.ls(Object.keys(source)[0], ".cct");
    if (files !== undefined && files !== null && files.length > 0) {
        if (!contractsFound.includes(Object.keys(source)[0])) {
            contractsFound.push(Object.keys(source)[0]);
            if (!quiet) ns.print("                                        CONTRACT FOUND ||||||||||||||||||||||||");
            await ns.write("found.contracts", contractsFound, "w");
        }
    }
    var connectionsp = ns.scan(Object.keys(source)[0]);
    var connections = [];
    for (var c = 0; c < connectionsp.length; c++) {
        if (connectionsp[c] != source[Object.keys(source)[0]]) {
            var serverInfo = ns.getServer(connectionsp[c]);
            if (serverInfo.purchasedByPlayer != true) {
                connections.push(connectionsp[c]);
            }
        }
    }


    for (var a = 0; a < connections.length; a++) {
        await ns.sleep(150);
        var result = await evalAndNuke(ns, connections[a], Object.keys(source)[0], target);
        var nextUp = {};
        nextUp[connections[a]] = Object.keys(source)[0];
        await scanServer(ns, nextUp, target, level);

    }
}

async function evalAndNuke(ns, server, origin, target) {
    var attackThis = server;
    var serverInfo = ns.getServer(attackThis);
    var returnResult = false;
    var player = ns.getPlayer();
    var playerLevel = player.hacking;
    if (!quiet) ns.print(`Evaluating ${server} to attack ${target}`);
    if (serverInfo.purchasedByPlayer == true) {
        return false;
    }
    if (serverInfo.hasAdminRights == true) {
        if (!Object.keys(ownedServers).includes(server)) {
            ownedServers[server] = origin;
        }
    }
    var level = ns.getServerRequiredHackingLevel(attackThis);

    if (highestLevelSeen < level) {
        highestLevelSeen = level;
    }
    if (level <= playerLevel || !ns.getServer(attackThis).backDoorInstalled) {
        // ns.print(`${crackers} ${ns.getServerNumPortsRequired(attackThis)} ${ns.getServer(attackThis).hasAdminRights}`);
        if (crackers >= ns.getServerNumPortsRequired(attackThis)) {
            if (!ns.getServer(attackThis).hasAdminRights) {
                if (ns.fileExists("BruteSSH.exe", 'home'))
                    ns.brutessh(attackThis);
                if (ns.fileExists("FTPCrack.exe", 'home'))
                    ns.ftpcrack(attackThis);
                if (ns.fileExists("relaySMTP.exe", 'home'))
                    ns.relaysmtp(attackThis);
                if (ns.fileExists("HTTPWorm.exe", 'home'))
                    ns.httpworm(attackThis);
                if (ns.fileExists("SQLInject.exe", 'home'))
                    ns.sqlinject(attackThis);
                if (ns.getServer(attackThis).openPortCount >= ns.getServer(attackThis).numOpenPortsRequired) {
                    returnResult = ns.nuke(attackThis);
                    ownedServers[server] = origin;
                    if (!quiet) {
                        ns.print(" ...conquered " + attackThis);
                    } else {
                        ns.print(`Nuked ${attackThis} level ${ns.getServerRequiredHackingLevel(attackThis)}`);
                        drawLCol(ns, `Nuked ${attackThis} level ${ns.getServerRequiredHackingLevel(attackThis)}`);
                        if (autoJoinServerFactions == true) {
                            if (['CSEC', 'I.I.I.I', 'run4theh111z'].includes(attackThis)) {
                                await travelToServer(ns, attackThis);
                                await ns.sleep(1000);
                                ns.run('/_scriptRamHelpers/_getCurrentServer.js');
                                await ns.sleep(100);
                                let currentServer = getItem(ns, 'currentServer');
                                if (currentServer == 'home') {
                                    ns.toast(`!!!!!!!!!! Failed to travel to ${attackThis} for backdooring`, 'warning', 60000);
                                } else {
                                    await ns.run('/_scriptRamHelpers/installBackdoor.js');
                                    let successInstall = getItem(ns, 'backdoorInstallResult');
                                    await ns.sleep(1000);
                                    if (successInstall) {
                                        ns.print(`Installed BACKDOOR into ${attackThis}`);
                                        ns.toast(`Installed BACKDOOR into ${attackThis}`, 'success', 10000);
                                    } else {
                                        ns.print(`!!!!!!!!!! Failed to install BACKDOOR into ${attackThis}`);
                                        ns.toast(`!!!!!!!!!! Failed to install BACKDOOR into ${attackThis}`, 'warning', 60000);
                                    }
                                    setItem(ns, 'backdoorInstallResult', false);
                                    await travelBackHome(ns, attackThis);
                                    await ns.sleep(1000);
                                    if (currentServer != 'home') {
                                        ns.toast(`!!!!!!!!!! Failed to return home from ${attackThis}`, 'warning', 60000);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            await startHacking(ns, server, target);

            /*if(!ns.getServer(attackThis).backDoorInstalled) {
                await ns.sleep(100);
                ns.print("Installing backdoor on "+attackThis);
                await ns.installBackdoor();
            }*/ //--WORK IN PROGRESS

        } else if (crackers < ns.getServerNumPortsRequired(attackThis) && attackThis !== 'darkweb') {
            if (!quiet) ns.print(`need ${ns.getServerNumPortsRequired(attackThis) - crackers} more crackers to nuke ${attackThis}`);
            if (!quiet) drawLCol(ns, `need ${ns.getServerNumPortsRequired(attackThis) - crackers} more crackers to nuke ${attackThis}`);
        }
    }
    return returnResult;
}

async function startHacking(ns, serv, thisTarget) {
    let serverDetails = { target: 'NotYetSet', forceUpdated: false };
    if (serversOnTarget !== undefined && serversOnTarget !== null && serversOnTarget[serv] !== undefined) {
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
            ns.print(`Killed scripts and scp'd new copies`);
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
            ns.print(`--------exec ${thisTarget} ${serv}`);
            await ns.exec('/_helpers/hackitManager.js', serv, 1, thisTarget, serv);
            serverDetails.target = thisTarget;
            ns.print(`Started /_helpers/hackitManager.js on [${serv}] attacking [${thisTarget}]`);
            drawLCol(ns, `Started /_helpers/hackitManager.js on [${serv}] attacking [${thisTarget}]`);
        }
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
    if (ns.getPlayer().hacking >= 100 && !ns.fileExists("relaySMTP.exe", 'home') && ns.getServerMoneyAvailable("home") >= 5000000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js', 1, "relaySMTP.exe");
        ns.toast("Bought relaySMTP");
    }
    if (ns.getPlayer().hacking >= 150 & !ns.fileExists("AutoLink.exe", 'home') && ns.getServerMoneyAvailable("home") >= 1500000) {
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