import { drawList1, drawStatus1, drawLCol, clearLCol } from '/terminal.js';
import { scan, findServerPath, money, chooseTarget, travelToServer, travelBackHome } from '/_helpers/helpers.js';
import { getItem, setItem } from '/_helpers/ioHelpers.js';


var ownedServers = { 'home': 'home' };
var autoJoinServerFactions = true;
var highestLevelSeen = 1;
var scriptRam = 0;
var purchaseServers = false;
var slice = 1;
var ram = 0;
var crackers = 0;
var networkMap = { 'home': {} };
var contractsFound = [];
var onlyHunting = false;
var designateTarget = false;
var quiet = true;
var autoTarget = false;
var singleSlice = true;
var memmoryLevels = [8, 32, 256, 1024, 2048, 4096, 32768, (128 * 1024), (512 * 1024), (1024 * 1024)];
var sleepBetweenSlices = .0001 * 1000;

const timeBetweenUpgradeLoops = .1 * 60 * 1000;
const timeBetweenNewPurchaseAndUpgradeLoop = .05 * 60 * 1000;


// args Ram, Slices, Target
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
    if(!ns.scriptRunning('/_schedules/schedule_openPorts.js','home')) {
        await ns.run('/_schedules/schedule_openPorts.js');
        await ns.sleep(5000);
    }
    ns.print("======================== Beginning Go Hack ========================");
    clearLCol(ns);
    drawLCol(ns, "======================== Beginning Go Hack ========================");
    ns.print(drawLCol(ns, `Largest Server Allowed ${money(ns.getPurchasedServerMaxRam())} gb`));
    for (let z = 0; z < ns.args.length; z++) {
        if (ns.args[z] !== undefined) {
            if (ns.args[z] == "-h" || ns.args[z] == "-?" || ns.args[z] == "?" || ns.args[z] == "h") {
                await ns.tprint("spiderHackBuy.js fullauto ||  Req:(ram nopurchase||Ram in GB)   Req:(slice count)  (target self||auto||target name) (singleslice)  (findserver targethere) (v verbose) ");
                await ns.tprint("Options:Purchase servers     This can run against net servers only or also buy player owned. If buying, specify the starting ram in GB, it will continue to evolve the servers size once the max has been purchased.");
                await ns.tprint("Options:Slice count     How many copies of the /_helpers/hackit.js app should run. More yields better overall returns. The thread count will be calculated based on server size and slice count. Minimum 1");
                await ns.tprint("Options: singleslice    This doesnt use multiple spawns per server just a single spawn with high threading");
                await ns.tprint("Options:Designate Target     Designate a server all conquered servers should attack, if not designated then conquered servers will be set to target themselves.");
                await ns.tprint("Options:Only Hunting    This only spiders the net for contract files or the-cave. All locations of contracts will be written to found.contracts");
                await ns.tprint("The app will discover the network and attempt to conquer any server below your level that you have appropriate crackers for. It will continue this loop as you continue to level up. It will also make sure all your owned servers are running the /_helpers/hackit.js script at full levels starting with home. If set to purchase servers, it will purchase servers at the memory level specified. Once 25 servers have been purchased it will recycle the oldest and purchase a server at the next memory size.");
                ns.exit();
            }
            if (ns.args[z] == 'v') {
                quiet = false;
            }
            if (ns.args[z] !== undefined && ns.args[0] == "fullauto") {
                designateTarget = true;
                autoTarget = true;
                var target = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["target"];
                slice = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["slice"];
                ram = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["ram"];
                ns.print(`Target Chosen: ${target} purchase level set ${ram}gb ${slice} slices`);
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
            if (ns.args[z] == 'slice' && ns.args[z + 1] != undefined && !isNan(ns.args[z + 1])) {
                slice = ns.args[z + 1];
                singleSlice = false;
            }
            if (ns.args[z] == 'target' && ns.args[z + 1] != undefined) {
                if (ns.args[z + 1] == "auto") {
                    designateTarget = true;
                    autoTarget = true;
                    var target = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["target"];
                    slice = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["slice"];
                    slice = 1;
                    ram = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["ram"];
                    ns.print(`Target Chosen: ${target} purchase level set ${ram}gb ${slice} slices`);
                } else {
                    designateTarget = true;
                    var target = ns.args[z + 1];
                }
            }
        }
    }
    ns.tail();


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
    scriptRam = ns.getScriptRam('/_helpers/hackit.js');



    if (!quiet) await ns.print(`Cost to purchase these servers with ${money(ram)}gb: $${Math.round(ns.getPurchasedServerCost(ram)).toLocaleString('en-US')}`);
    drawLCol(`Cost to purchase these servers with ${money(ram)}gb: $${Math.round(ns.getPurchasedServerCost(ram)).toLocaleString('en-US')}`);


    var serv = 'home';
    var rand = Math.random();

    if (designateTarget === false) {
        target = serv;
    }
    var threads = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) / scriptRam);
    threads = threads - 6;
    if (threads < 1) {
        threads = 1;
    }
    if (!ns.scriptRunning('/_helpers/hackit.js', 'home')) {
        await ns.run("/_helpers/hackit.js", threads, target);
    }
    if ((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) > Math.ceil(scriptRam)) {
        var extraCopies = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) / scriptRam);
        extraCopies = extraCopies - 6;
        if (extraCopies > 0) {
            if (!quiet) await ns.print("Starting " + extraCopies + " extra hackit threads on " + serv);
            await ns.run("/_helpers/hackit.js", extraCopies, target, rand, extraCopies);
        }
    }
    rand = Math.random();
    serv = 'n00dles';
    if (designateTarget === false) {
        target = serv;
    }
    var threads = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) / scriptRam);
    if (threads < 1) {
        threads = 1;
    }
    if (!ns.scriptRunning('/_helpers/hackit.js', serv)) {
        await ns.run("/_helpers/hackit.js", threads, target);
    }
    if ((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) > Math.ceil(scriptRam)) {
        var extraCopies = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) / scriptRam);
        if (extraCopies > 0) {
            if (!quiet) await ns.print("Starting " + extraCopies + " extra hackit threads on " + serv);
            await ns.exec("/_helpers/hackit.js", serv, extraCopies, target, rand, extraCopies);
        }
    }

    // Make sure our servers are running optimal threads
    if (!quiet) await ns.print("Optimizing our purchased servers...");
    drawLCol(ns, "Optimizing our purchased servers...");
    if (designateTarget !== false) {
        
        ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
        await ns.sleep(1000);
        var attackServers = getItem(ns,'purchasedServers');
        await ns.sleep(1000);
        for (var a = 0; a < attackServers.length; a++) {
            var hostname = attackServers[a];
            await ns.scp(["/_helpers/hackit.js","/_helpers/ioHelpers.js"], hostname);
            if (!quiet) ns.print(` analyzing server ${a + 1} ${hostname}`);
            if (!ns.fileExists('/_helpers/hackit.js', hostname)) {
                await ns.scp("/_helpers/hackit.js", hostname);
            }
            if (singleSlice) {
                slice = 1;
            }
            if (!quiet) await ns.print("...preparing to use " + slice + " slices");
            if (!quiet) await ns.print(`thisThreads = Math.floor((${ns.getServerMaxRam(hostname)}/${scriptRam}/${slice}) = ${Math.floor((ns.getServerMaxRam(hostname)) / scriptRam / slice)}`);
            let thisThreads = Math.floor((ns.getServerMaxRam(hostname)) / scriptRam / slice);
            for (var s = 1; s <= slice; s++) {
                if (thisThreads < 1) {
                    thisThreads = 1;
                }
                let tag = s;
                if (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) > (scriptRam * thisThreads)) {
                    if (singleSlice)
                        tag = thisThreads;
                    else
                        tag = `${s}:${thisThreads}`;
                    await ns.exec("/_helpers/hackit.js", hostname, thisThreads, target, tag);
                    await ns.sleep(3);
                    await ns.sleep(sleepBetweenSlices);
                } else {
                    break;
                }
            }
            if ((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) > scriptRam) {
                var extraCopies = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / scriptRam);
                if (serv == "home") {
                    extraCopies = extraCopies - 5;
                }
                if (extraCopies < 1) {
                    extraCopies = 1;
                }
                if (!quiet) await ns.print("Starting " + extraCopies + " extra hackit threads on " + hostname);
                drawLCol(ns, ` filling unused RAM on [${hostname}] with ${extraCopies} threads`);
                await ns.exec("/_helpers/hackit.js", hostname, extraCopies, target, s, extraCopies);
                await ns.sleep(300);
            }
        }
    }

    var i = 0;

    // Continuously try to purchase servers until we've reached the maximum
        ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
        await ns.sleep(250);
        var attackServers = getItem(ns,'purchasedServers');
    if (purchaseServers == true && attackServers.length < ns.getPurchasedServerLimit()) {
        drawLCol(ns, "Beginning NEW server purchase loop");
    }
    var lastTarget = "";
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
        await scanServer(ns, { 'home': 'home' }, target, 0);

        if (autoTarget) {
            slice = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["slice"];
            target = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["target"];
            ram = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["ram"];
            await ns.sleep(100);
            if (lastTarget != target) {
                await ns.print(await drawLCol(ns, `AutoTarget:: RAM ${money(ram)}gb SLICES ${money(slice)} TARGET ${target} $${money(ns.getPurchasedServerCost(ram))}`));
                lastTarget = target;
            }
        }
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            var hostname = `attack-${target}-${ram}gb-${i}`;
            ns.run('/_scriptRamHelpers/_purchaseServer.js',1,hostname,ram);
            await ns.sleep(1000);
            checkForApps(ns);
            ns.print(`Purchased [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
            drawLCol(ns, `Purchased [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
            if (ns.serverExists(hostname)) {
                if (!quiet) await ns.print("...preparing to use " + slice + " slices");
                if (!quiet) await ns.print(`thisThreads = Math.floor((${ns.getServerMaxRam(hostname)}/${scriptRam}/${slice}) = ${Math.floor((ns.getServerMaxRam(hostname)) / scriptRam / slice)}`);
                let thisThreads = Math.floor((ns.getServerMaxRam(hostname)) / scriptRam / slice);
                if (!quiet) ns.print(`Calculated for ${slice} slices it should thread at ${money(ram)} / ${scriptRam} / ${slice} is ${thisThreads}`);
                for (var s = 1; s <= slice; s++) {
                    await ns.scp("/_helpers/hackit.js", serv);
                    await ns.scp(["/_helpers/hackit.js","/_helpers/ioHelpers.js"], serv);
                    if (!ns.fileExists('/_helpers/hackit.js', hostname)) {
                        await ns.scp("/_helpers/hackit.js", hostname);
                    }
                    if (singleSlice) {
                        slice = 1;
                    }

                    if (thisThreads < 1) {
                        thisThreads = 1;
                    }
                    let tag = "";
                    if (singleSlice)
                        tag = thisThreads;
                    else
                        tag = `${s}:${thisThreads}`;
                    if ((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) >= (scriptRam * thisThreads)) {
                        await ns.exec("/_helpers/hackit.js", hostname, thisThreads, target, s, tag);
                        await ns.sleep(sleepBetweenSlices);
                    } else {
                        break;
                    }
                    await ns.sleep(sleepBetweenSlices);
                }
                if ((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) > scriptRam) {
                    var extraCopies = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / scriptRam);
                    if (extraCopies < 1) {
                        extraCopies = 1;
                    }
                    if (!quiet) await ns.print("Starting " + extraCopies + " extra hackit threads on " + hostname);
                    await ns.exec("/_helpers/hackit.js", hostname, extraCopies, target, s, extraCopies);
                }
            }
            ++i;
        } else {
            ns.print(` ... need $${money(ns.getPurchasedServerCost(ram) - ns.getServerMoneyAvailable('home'))} more `);
        }
        await ns.sleep(timeBetweenNewPurchaseAndUpgradeLoop);
        ns.run('_scriptRamHelpers/_getPurchasedServers.js');
        await ns.sleep(100);
        attackServers = getItem(ns,'purchasedServers');
        await ns.sleep(250);
    }

    if (!quiet) ns.print("Spidering...");
    drawLCol(ns, "scanning for servers now in attack level...");
    await scanServer(ns, { 'home': 'home' }, target, 0);

    ns.print("Moving on to upgrade loop in 10 minutes...");
    drawLCol(ns, "Moving on to upgrade loop in 10 minutes...");
    if (autoTarget) {
        slice = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["slice"];
        target = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["target"];
        ram = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["ram"];
    }
    ns.print(drawLCol(ns, `Starting Upgrade Loop at ${money(ram)}gb and ${slice} slices @ ${money(ns.getPurchasedServerCost(ram))}`));

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
            slice = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["slice"];
            target = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["target"];
            ram = chooseTarget(ns, ns.getPlayer()["hacking"], ram)["ram"];
        }
        var upgrade = true;
        ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
        await ns.sleep(250);
        var servers = getItem(ns,'purchasedServers');
        await ns.sleep(100);
        if (!quiet) ns.print("Spidering...");
        await scanServer(ns, { 'home': 'home' }, target, 0);
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            for (var a = 0; a < 25; a++) {
                if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
                    if (ns.getServerMaxRam(servers[a]) < ram) {
                        if (!quiet) await ns.print("Upgrading " + servers[a] + " from " + ns.getServerMaxRam(servers[a]) + " to " + ram);
                        var skillSuck = ns.scriptKill("/_helpers/hackit.js", servers[a]);
                        var delSuc = ns.deleteServer(servers[a]);
                        if (delSuc == true) {
                            if (!quiet) await ns.print(" Deleted " + servers[a]);
                            upgrade = false;
                        } else {
                            if (!quiet) await ns.print("  Problem Deleting " + servers[a]);
                            if (skillSuck == true) {
                                if (!quiet) await ns.print("   Suceeded in killing /_helpers/hackit.js");
                            } else {
                                if (!quiet) await ns.print("   Failed to kill /_helpers/hackit.js");
                            }
                        }
            var hostname = `attack-${target}-${ram}gb-${i}`;
            ns.run('/scriptRamHelpers/_purchaseServer.js',1,hostname,ram);
            await ns.sleep(1000);
                        if (ns.serverExists(hostname)) {
                            if (singleSlice) {
                                slice = 1;
                            }
                            checkForApps(ns);
                            if (!quiet) await ns.print(" Purchased " + hostname);
                            ns.print(`Recycled [${servers[a]}] into [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
                            drawLCol(ns, `Recycled [${servers[a]}] into [${hostname}] for $${money(ns.getPurchasedServerCost(ram))} w/${money(ram)}gb`);
                            if (!ns.fileExists('/_helpers/hackit.js', hostname)) {
                                await ns.scp("/_helpers/hackit.js", hostname);
                            }
                            await ns.scp(["/_helpers/hackit.js","/_helpers/ioHelpers.js"], serv);

                            if (!quiet) await ns.print("...preparing to use " + slice + " slices");
                            if (!quiet) await ns.print(`extraCopies = Math.floor((${ns.getServerMaxRam(hostname)}/${scriptRam}/${slice}) = ${Math.floor((ns.getServerMaxRam(hostname)) / scriptRam / slice)}`);
                            let extraCopies = Math.floor((ns.getServerMaxRam(hostname)) / scriptRam / slice);
                            if (!quiet) ns.print(`Calculated for ${slice} slices it should thread at ${money(ram)} / ${scriptRam} / ${slice} is ${extraCopies}`);
                            for (var s = 1; s <= slice; s++) {
                                if (extraCopies < 1) {
                                    extraCopies = 1;
                                }
                                let tag = "";
                                if (singleSlice)
                                    tag = extraCopies;
                                else
                                    tag = `${s}:${extraCopies}`;
                                if ((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) >= (scriptRam * extraCopies)) {
                                    await ns.exec("/_helpers/hackit.js", hostname, extraCopies, target, s, tag);
                                    await ns.sleep(sleepBetweenSlices);
                                } else {
                                    break;
                                }
                            }
                            if ((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) >= (scriptRam * extraCopies)) {
                                let extraCopies = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / scriptRam);
                                if (extraCopies < 1) {
                                    extraCopies = 1;
                                }
                                if (!quiet) await ns.print("Starting " + extraCopies + " extra hackit threads on " + hostname);
                                await ns.exec("/_helpers/hackit.js", hostname, extraCopies, target, s, extraCopies);
                            }
                        }
                        ns.print("Next server cost $" + ns.getPurchasedServerCost(ram).toLocaleString('en-US'));
                        drawLCol(ns, "Next server cost $" + ns.getPurchasedServerCost(ram).toLocaleString('en-US'));
                    }
                }

            }
        } else {
            if (!quiet) await ns.print("Not enough money to upgrade yet, need: $" + money(ns.getPurchasedServerCost(ram)));
            await ns.sleep(Math.round(timeBetweenUpgradeLoops / 2));
        }
        ns.run('/_scriptRamHelpers/_getPurchasedServers.js');
        await ns.sleep(250);
        servers = getItem(ns,'purchasedServers');
        await ns.sleep(100);
        for (var a = 0; a < servers.length; a++) {
            if (upgrade == false || ns.getServerMaxRam(servers[a]) < ram) {
                upgrade = false;
            }
        }
        if (upgrade == true) {
            checkForApps(ns);
            slice = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["slice"];
            ram = chooseTarget(ns, ns.getPlayer()["hacking"], 8)["ram"];
            if (singleSlice) {
                slice = 1;
            }
            await ns.sleep(50000);
            await ns.print("-- Setting Upgrade Server Ram to " + money(ram));
            await ns.print("    New server cost: " + money(ns.getPurchasedServerCost(ram)));
            drawLCol(ns, "-- Setting Upgrade Server Ram to " + money(ram));
            drawLCol(ns, "    New server cost: " + money(ns.getPurchasedServerCost(ram)));
            upgrade = false;
        }
        upgrade = true;
        await ns.sleep(timeBetweenUpgradeLoops);

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
    if (level <= playerLevel && ((ns.getServerMaxRam(attackThis) - ns.getServerUsedRam(attackThis)) > (scriptRam) || (ns.getServerMaxRam(attackThis) < Math.ceil(scriptRam) || !ns.getServer(attackThis).backDoorInstalled))) {
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
                                let currentServer = getItem(ns,'currentServer');
                                if (currentServer == 'home') {
                                    ns.toast(`!!!!!!!!!! Failed to travel to ${attackThis} for backdooring`, 'warning', 60000);
                                } else {
                                    await ns.run('/_scriptRamHelpers/installBackdoor.js');
                                    let successInstall = getItem(ns,'backdoorInstallResult');
                                    await ns.sleep(1000);
                                    if (successInstall) {
                                        ns.print(`Installed BACKDOOR into ${attackThis}`);
                                        ns.toast(`Installed BACKDOOR into ${attackThis}`, 'success', 10000);
                                    } else {
                                        ns.print(`!!!!!!!!!! Failed to install BACKDOOR into ${attackThis}`);
                                        ns.toast(`!!!!!!!!!! Failed to install BACKDOOR into ${attackThis}`, 'warning', 60000);
                                    }
                                    setItem(ns,'backdoorInstallResult',false);
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
            ns.print(`need ${ns.getServerNumPortsRequired(attackThis) - crackers} more crackers to nuke ${attackThis}`);
            drawLCol(ns, `need ${ns.getServerNumPortsRequired(attackThis) - crackers} more crackers to nuke ${attackThis}`);
        }
    }
    return returnResult;
}

async function startHacking(ns, serv, thisTarget) {
await ns.scp("/_helpers/hackit.js", serv);
await ns.scp(["/_helpers/hackit.js","/_helpers/ioHelpers.js"], serv);
    if (!ns.fileExists("/_helpers/hackit.js", serv)) {
        await ns.scp("/_helpers/hackit.js", serv);
    }
    

    var targetRam = ns.getServerMaxRam(serv);
    var threads = Math.floor(targetRam / Math.ceil(ns.getScriptRam("/_helpers/hackit.js")));
    if (threads < 1) {
        threads = 1;
    }
    var rand = Math.random();
    await ns.sleep(50);
    let startedNewThreads = false;

    let maxSlices = Math.floor((targetRam / scriptRam));
    if (maxSlices > slice) {
        slice = maxSlices;
    }
    if (singleSlice) {
        slice = 1;
    }
    for (var s = 1; s <= slice; s++) {
        let thisThreads = Math.floor(targetRam / slice / scriptRam);
        if (thisThreads < 1) {
            thisThreads = 1;
        }
        if (((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) > scriptRam)) {
            startedNewThreads = true;
            await ns.exec("/_helpers/hackit.js", serv, thisThreads, thisTarget, s);
            await ns.sleep(100);
        } else {
            break;
        }

    }

    if ((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) >= (scriptRam * extraCopies)) {
        var extraCopies = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) / scriptRam);
        if (extraCopies > 0) {
            if (!quiet) await ns.print("Starting " + extraCopies + " extra hackit threads on " + serv);
            await ns.exec("/_helpers/hackit.js", serv, extraCopies, thisTarget, rand, extraCopies + 1);
        }
    }
    if (startedNewThreads == true) {
        ns.print(`Started /_helpers/hackit.js on [${serv}] attacking [${thisTarget}]`);
        drawLCol(ns, `Started /_helpers/hackit.js on [${serv}] attacking [${thisTarget}]`);
    }
}

async function checkForApps(ns) {
    if (ns.getPlayer()["tor"] == false && ns.getServerMoneyAvailable("home") >= 200000) {
        ns.run('/_scriptRamHelpers/_purchaseTor.js');
        ns.toast("Bought Tor");
        await ns.sleep(1000);
    }

    if (!ns.fileExists("BruteSSH.exe", 'home') && ns.getServerMoneyAvailable("home") >= 500000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js',1,"BruteSSH.exe");
        ns.toast("Bought BruteSSH");
    }
    if (!ns.fileExists("FTPCrack.exe", 'home') && ns.getServerMoneyAvailable("home") >= 1500000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js',1,"FTPCrack.exe");
        ns.toast("Bought FTPCrack");
    }
    if (ns.getPlayer().hacking >= 300 && !ns.fileExists("relaySMTP.exe", 'home') && ns.getServerMoneyAvailable("home") >= 5000000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js',1,"relaySMTP.exe");
        ns.toast("Bought relaySMTP");
    }
    if (ns.getPlayer().hacking >= 400 & !ns.fileExists("AutoLink.exe", 'home') && ns.getServerMoneyAvailable("home") >= 1500000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js',1,"AutoLink.exe");
        ns.toast("Bought AutoLink");
    }
    if (!ns.fileExists("HTTPWorm.exe", 'home') && ns.getServerMoneyAvailable("home") >= 30000000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js',1,"HTTPWorm.exe");
        ns.toast("Bought HTTPWorm");
    }
    if (!ns.fileExists("SQLInject.exe", 'home') && ns.getServerMoneyAvailable("home") >= 250000000) {
        ns.run('_scriptRamHelpers/_purchaseProgram.js',1,"SQLInject.exe");
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