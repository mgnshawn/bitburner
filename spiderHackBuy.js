import {drawList1, drawStatus1, drawLCol, clearLCol} from '/terminal.js';
import { scan, findServerPath, money, chooseTarget } from './helpers.js';

var ownedServers = {'home':'home'};
var highestLevelSeen = 1;
var scriptRam = 0;
var purchaseServers = true;
var slice = 1;
var crackers = 0;
var networkMap = {'home':{}};
var contractsFound = [];
var onlyHunting = false;
var designateTarget = false;
var quiet = true;
var autoTarget = false;
var memmoryLevels = [8,32,256,1024,2048,4096,32768,(128*1024),(512*1024),(1024*1024)];

const timeBetweenUpgradeLoops = 1 * 60 * 1000;
 const timeBetweenNewPurchaseAndUpgradeLoop = .5 * 60 * 1000;


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
    ns.disableLog('scp');
    ns.disableLog('brutessh');
    ns.disableLog('ftpcrack');
    ns.disableLog('relaysmtp');
    ns.disableLog('httpworm');
    ns.disableLog('sqlinject');
    ns.disableLog('nuke');
    ns.print("======================== Beginning Go Hack ========================");
    clearLCol(ns);
    drawLCol(ns,"======================== Beginning Go Hack ========================");
    for(let z=0;z<ns.args.length;z++) {
		if(ns.args[z] !== undefined) {
            if(ns.args[z] == "-h" || ns.args[z] == "-?" || ns.args[z] == "?"|| ns.args[z] == "h") {
                await ns.tprint("freshstart.js Req:(ram nopurchase||Ram in GB)   Req:(slice count)  (target self||auto||target name)  (findserver targethere) (v verbose) ");
                await ns.tprint("Options:Purchase servers     This can run against net servers only or also buy player owned. If buying, specify the starting ram in GB, it will continue to evolve the servers size once the max has been purchased.");
                await ns.tprint("Options:Slice count     How many copies of the hackit.js app should run. More yields better overall returns. The thread count will be calculated based on server size and slice count. Minimum 1");
                await ns.tprint("Options:Designate Target     Designate a server all conquered servers should attack, if not designated then conquered servers will be set to target themselves.");
                await ns.tprint("Options:Only Hunting    This only spiders the net for contract files or the-cave. All locations of contracts will be written to found.contracts");
                await ns.tprint("The app will discover the network and attempt to conquer any server below your level that you have appropriate crackers for. It will continue this loop as you continue to level up. It will also make sure all your owned servers are running the hackit.js script at full levels starting with home. If set to purchase servers, it will purchase servers at the memory level specified. Once 25 servers have been purchased it will recycle the oldest and purchase a server at the next memory size.");
                ns.exit();
            }
			if(ns.args[z] == 'v') {
				quiet = false;
			}
            if(ns.args[z] == 'findserver' && ns.args[z+1] != undefined) {
                let foundServers = await scan(ns);                
                var searchTarget = ns.args[z+1];
                let pathToTarget = await findServerPath(ns,searchTarget);
	            ns.tprint(pathToTarget);
                ns.exit();
            }
            if(ns.args[z] == 'ram' && ns.args[z+1] != undefined)
            {
                if(ns.args[z+1] == "nopurchase" || ns.args[z+1] == "n") {
                    purchaseServers = false;
                    if(ns.args[z+2] !== undefined) {
                    var ram = ns.args[z+2];
                    } else {
                        var ram = 1024;
                    }
                } else {
                    var ram = ns.args[z+1];
                }
            }
            if(ns.args[z] == 'slice' && ns.args[z+1] != undefined)
            {   slice = ns.args[z+1];                
            }
            if(ns.args[z] == 'target' && ns.args[z+1] != undefined)
            {
                if(ns.args[z+1] == "self") {
                    designateTarget = false;
                } else if(ns.args[z+1] == "auto") {
                    designateTarget = true;
                    autoTarget = true;
                    var target = chooseTarget(ns,ns.getPlayer()["hacking"])["target"];                    
                    slice = chooseTarget(ns,ns.getPlayer()["hacking"])["slice"];
                    ram = chooseTarget(ns, ns.getPlayer()["hacking"])["ram"];
                    ns.print("Target Chosen: "+target);
                } else {
                    designateTarget = true;
                    var target = ns.args[z+1];
                }
                
            }
		}
	}    
    ns.tail();

    for (let m of memmoryLevels) {
        if(ram < m) {
            ram = m;
            break;
        }
    }
	

    if(ns.fileExists("BruteSSH.exe"))
        crackers++;
    if(ns.fileExists("FTPCrack.exe"))
        crackers++;
    if(ns.fileExists("relaySMTP.exe"))
        crackers++;
    if(ns.fileExists("HTTPWorm.exe"))
        crackers++;
    if(ns.fileExists("SQLInject.exe"))
        crackers++;
    scriptRam = ns.getScriptRam('hackit.js');
    
    
    
    var currentServerLevelIndex = 0;
    if(ram == 'n') {
        ram = 8;
    }
    for(var l = 0; l < memmoryLevels.length; l++) {
        if(ram > memmoryLevels[l]) {
            currentServerLevelIndex = (l+1);
        }
    }
    var currentServerLevel = memmoryLevels[currentServerLevelIndex];

    if(!quiet)await ns.print(`Cost to purchase these servers with ${ram}gb: $${Math.round(ns.getPurchasedServerCost(ram)).toLocaleString('en-US')}`);
    drawLCol(`Cost to purchase these servers with ${ram}gb: $${Math.round(ns.getPurchasedServerCost(ram)).toLocaleString('en-US')}`);


    var serv = 'home';
    var rand = Math.random();
    
    if(designateTarget === false) {
        target = serv;
    }
    var threads = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv))/scriptRam);
    threads = threads - 6;
    if(threads < 1) {
        threads = 1;
    }
    if(!ns.scriptRunning('hackit.js','home')) {
        await ns.run("hackit.js", threads, target);
    }
    if((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) > Math.ceil(scriptRam)) {
        var extraCopies = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv))/scriptRam);
        extraCopies = extraCopies - 6;
        if(extraCopies > 0) {
            if(!quiet)await ns.print("Starting "+extraCopies+" extra hackit threads on "+serv);
                await ns.run("hackit.js", extraCopies, target, rand, extraCopies);                
        }
    }
    rand = Math.random();
    serv = 'n00dles';
    if(designateTarget === false) {
        target = serv;
    }
    var threads = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv))/scriptRam);
    if(threads < 1) {
        threads = 1;
    }
    if(!ns.scriptRunning('hackit.js',serv)) {
        await ns.run("hackit.js", threads, target);
    }
    if((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) > Math.ceil(scriptRam)) {
        var extraCopies = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv))/scriptRam);
        if(extraCopies > 0) {
            if(!quiet)await ns.print("Starting "+extraCopies+" extra hackit threads on "+serv);
                await ns.exec("hackit.js",serv, extraCopies, target, rand, extraCopies);                
        }
    }

// Make sure our servers are running optimal threads
if(!quiet)await ns.print("Optimizing our purchased servers...");
drawLCol(ns,"Optimizing our purchased servers...");
if(designateTarget !== false ) {
    var attackServers = await ns.getPurchasedServers();
    for(var a = 0; a < attackServers.length; a++) {
        var hostname = attackServers[a];
        for(var s=1;s<=slice;s++) {
            if(!ns.fileExists('hackit.js',hostname)) {
                await ns.scp("hackit.js", hostname);
            }
            let thisThreads = Math.floor((ram)/Math.ceil(scriptRam)/slice);
            if(thisThreads < 1) {
                thisThreads = 1;
            }
            if(ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) > (scriptRam*threads)) {
                await ns.exec("hackit.js", hostname, thisThreads, target,s);
            }
            await ns.sleep(300);
        }
        if((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) > scriptRam) {
            var extraCopies = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))/scriptRam);
            if(serv == "home") {
                extraCopies = extraCopies - 5;
            }
            if(extraCopies < 1) {
                extraCopies = 1;
            }
                if(!quiet)await ns.print("Starting "+extraCopies+" extra hackit threads on "+hostname);
                drawLCol(ns,` filling unused RAM on [${hostname}] with ${extraCopies} threads`);
                await ns.exec("hackit.js", hostname, extraCopies, target, s, extraCopies);                
        }
        /*rand = Math.random();
        if((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) > Math.ceil(scriptRam)) {
            for(j=0;j<slice;j++) {
            var extraCopies = Math.floor(((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv))/scriptRam)/slice);
            if(serv == "home") {
                extraCopies = extraCopies - 5;
            }
            if(extraCopies > 0) {
                if(!quiet)await ns.print("Starting "+extraCopies+" extra hackit threads on owned server: "+serv);
                await ns.exec("hackit.js", serv, extraCopies, target, rand, extraCopies);                
            }
            }
        }*/
    }
}

var i = 0;

// Continuously try to purchase servers until we've reached the maximum
if(purchaseServers == true && ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
    drawLCol(ns,"Beginning NEW server purchase loop");
}
while (purchaseServers == true && ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
    await checkForApps(ns);
    crackers = 0;
    if(ns.fileExists("BruteSSH.exe"))
        crackers++;
    if(ns.fileExists("FTPCrack.exe"))
        crackers++;
    if(ns.fileExists("relaySMTP.exe"))
        crackers++;
    if(ns.fileExists("HTTPWorm.exe"))
        crackers++;
    if(ns.fileExists("SQLInject.exe"))
        crackers++;
    if(!quiet)ns.print("Spidering...");
    await scanServer(ns,{'home':'home'}, target, 0);

    if(autoTarget) {
        slice = chooseTarget(ns,ns.getPlayer()["hacking"])["slice"];
        target = chooseTarget(ns,ns.getPlayer()["hacking"])["target"];
        ram = chooseTarget(ns,ns.getPlayer()["hacking"])["ram"];
    }
    // Check if we have enough money to purchase a server
    
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {        
        var hostname = ns.purchaseServer("attack-"+target+"-"+(ram)+"gb-"+ i, (ram));
        checkForApps(ns);
        ns.print(`Purchased [${hostname}] for $${ns.getPurchasedServerCost(ram)} w/${ram}gb`);
        drawLCol(ns,`Purchased [${hostname}] for $${ns.getPurchasedServerCost(ram)} w/${ram}gb`);
        if(hostname !== undefined && hostname !== null && ns.getServer(hostname) !== undefined && ns.getServer(hostname) !== null) {
            for(var s=1;s<=slice;s++) {
                if(!ns.fileExists('hackit.js',hostname)) {
                    await ns.scp("hackit.js", hostname);
                }
                let thisThreads = Math.floor(ram/slice/scriptRam);
                if(!quiet) ns.print(`Calculated for ${slice} slices it should thread at ${ram} / ${scriptRam} / ${slice} is ${thisThreads}`);
                if(thisThreads < 1) {
                    thisThreads = 1;
                }
                if((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) >= (scriptRam*thisThreads)) {
                    await ns.exec("hackit.js", hostname, thisThreads, target,s, thisThreads);
                }
                await ns.sleep(300);
            }
            if((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) > scriptRam) {
                var extraCopies = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))/scriptRam);
                if(extraCopies < 1) {
                    extraCopies = 1;
                }
                    if(!quiet)await ns.print("Starting "+extraCopies+" extra hackit threads on "+hostname);
                    await ns.exec("hackit.js", hostname, extraCopies, target, s, extraCopies);                
            }
        }
        ++i;
    }

    await ns.sleep(timeBetweenNewPurchaseAndUpgradeLoop);
}
if(!quiet)ns.print("Spidering...");
drawLCol(ns,"scanning for servers now in attack level...");
await scanServer(ns,{'home':'home'}, target, 0);

ns.print("Moving on to upgrade loop in 10 minutes...");
drawLCol(ns,"Moving on to upgrade loop in 10 minutes...");

while (purchaseServers == true && currentServerLevel <= memmoryLevels[(memmoryLevels.length-1)]) {
    await checkForApps(ns);
    crackers = 0;
    if(ns.fileExists("BruteSSH.exe"))
        crackers++;
    if(ns.fileExists("FTPCrack.exe"))
        crackers++;
    if(ns.fileExists("relaySMTP.exe"))
        crackers++;
    if(ns.fileExists("HTTPWorm.exe"))
        crackers++;
    if(ns.fileExists("SQLInject.exe"))
        crackers++;
    if(autoTarget) {
        slice = chooseTarget(ns,ns.getPlayer()["hacking"])["slice"];
        target = chooseTarget(ns,ns.getPlayer()["hacking"])["target"];
        currentServerLevel = chooseTarget(ns,ns.getPlayer()["hacking"])["ram"];
    }
    var upgrade = true;
    var servers = ns.getPurchasedServers();
       if(!quiet)ns.print("Spidering...");
        await scanServer(ns,{'home':'home'}, target, 0);
        if(ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(currentServerLevel)) {
        for(var a = 0; a < 25; a++) {
            if(ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(currentServerLevel)) {
                if(ns.getServerMaxRam(servers[a]) < currentServerLevel) {
                    if(!quiet)await ns.print("Upgrading "+servers[a]+" from "+ ns.getServerMaxRam(servers[a])+" to "+currentServerLevel);
                    var skillSuck = ns.scriptKill("hackit.js",servers[a]);                    
                    var delSuc = ns.deleteServer(servers[a]);
                    if(delSuc == true) {
                    if(!quiet)await ns.print(" Deleted "+servers[a]);
                    upgrade = false;
                    } else {
                        if(!quiet)await ns.print("  Problem Deleting "+servers[a]);
                        if(skillSuck == true) {
                            if(!quiet)await ns.print("   Suceeded in killing hackit.js");
                        } else {
                            if(!quiet)await ns.print("   Failed to kill hackit.js");
                        }
                    }                    
                    var hostname = ns.purchaseServer("attack-"+target+"-"+(currentServerLevel)+"gb-"+ i, (currentServerLevel));
                    if(hostname !== undefined && hostname !== null && hostname.length != 0) {
                        checkForApps(ns);
                        if(!quiet)await ns.print(" Purchased "+hostname);
                        ns.print(`Recycled [${servers[a]}] into [${hostname}] for $${ns.getPurchasedServerCost(currentServerLevel)} w/${currentServerLevel}gb`);
                        drawLCol(ns,`Recycled [${servers[a]}] into [${hostname}] for $${ns.getPurchasedServerCost(currentServerLevel)} w/${currentServerLevel}gb`);
                        if(!ns.fileExists('hackit.js', hostname)) {
                            await ns.scp("hackit.js", hostname);
                        }
                        let extraCopies = Math.floor((currentServerLevel/slice/scriptRam));
                        if(!quiet) ns.print(`Calculated for ${slice} slices it should thread at ${currentServerLevel} / ${scriptRam} / ${slice} is ${extraCopies}`);
                        for(var s=1;s<=slice;s++) {
                            if(extraCopies < 1) {
                                extraCopies = 1;
                            }
                            await ns.exec("hackit.js", hostname, extraCopies , target,s,extraCopies);
                            await ns.sleep(100);
                        }
                        if((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) >= (scriptRam*extraCopies)) {
                            let extraCopies = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))/scriptRam);
                            if(extraCopies < 1) {
                                extraCopies = 1;
                            }
                            if(!quiet)await ns.print("Starting "+extraCopies+" extra hackit threads on "+hostname);
                            await ns.exec("hackit.js", hostname, extraCopies, target, s, extraCopies);                
                        }
                    }
                    ns.print("Next server cost $"+ns.getPurchasedServerCost(currentServerLevel).toLocaleString('en-US'));
                    drawLCol(ns,"Next server cost $"+ns.getPurchasedServerCost(currentServerLevel).toLocaleString('en-US'));
                }
            }
            
        } 
        } else {
                if(!quiet)await ns.print("Not enough money to upgrade yet, need: $"+money(ns.getPurchasedServerCost(currentServerLevel)));
                await ns.sleep(Math.round(timeBetweenUpgradeLoops/2));
        }
        for(var a = 0;a < ns.getPurchasedServers().length; a++) {
            if(upgrade == false || ns.getServerMaxRam(servers[a]) < currentServerLevel) {
                upgrade = false;
            }
        }
        if(upgrade == true) {           
            checkForApps(ns);
            await ns.sleep(50000);
            currentServerLevelIndex++;
            currentServerLevel = memmoryLevels[currentServerLevelIndex];
            await ns.print("-- Setting Upgrade Server Ram to "+currentServerLevel);
            await ns.print("    New server cost: "+ns.getPurchasedServerCost(currentServerLevel).toLocaleString('en-US'));
            drawLCol(ns,"-- Setting Upgrade Server Ram to "+currentServerLevel);
            drawLCol(ns,"    New server cost: "+ns.getPurchasedServerCost(currentServerLevel).toLocaleString('en-US'));
            upgrade = false;
        }
        upgrade = true;
        await ns.sleep(timeBetweenUpgradeLoops);
        
    }

    while(true) {
        await checkForApps(ns);
        if(!quiet)ns.print("Spidering...");
        drawLCol(ns,"scanning for servers now in attack level...");
        await scanServer(ns,{'home':'home'}, target, 0);
        await ns.sleep(60000);
    }
    ns.enableLog('sleep');
}



async function scanServer(ns,source, target, level) {
    level++;
    var spacer = "";
    for(var sp=0; sp < level; sp++) {
        spacer = spacer+" ";
    }
    let files = ns.ls(Object.keys(source)[0],".cct");
    if(files !== undefined && files !== null && files.length > 0) {
        if(!contractsFound.includes(Object.keys(source)[0])) {
           contractsFound.push(Object.keys(source)[0]);
           if(!quiet)ns.print("                                        CONTRACT FOUND ||||||||||||||||||||||||");
           await ns.write("found.contracts",contractsFound,"w");
        }
    }
	var connectionsp = ns.scan(Object.keys(source)[0]);
    var connections = [];
	for(var c = 0; c < connectionsp.length;c++) {        
        if(connectionsp[c] != source[Object.keys(source)[0]]) {
            var serverInfo = ns.getServer(connectionsp[c]);
            if(serverInfo.purchasedByPlayer != true) {
                connections.push(connectionsp[c]);
            }
        }
    }
		
        
    for(var a = 0; a < connections.length; a++) {
        await ns.sleep(150);
        var result = await evalAndNuke(ns,connections[a],Object.keys(source)[0], target);
        var nextUp = {};
        nextUp[connections[a]]=Object.keys(source)[0];
        await scanServer(ns,nextUp,target,level );
        
    }
}

async function evalAndNuke(ns,server,origin,target) {
		var attackThis = server;
		var serverInfo = ns.getServer(attackThis);
		var returnResult = false;
		var player = ns.getPlayer();
		var playerLevel = player.hacking;
		if(serverInfo.purchasedByPlayer == true) {
			return false;
		}
		if(serverInfo.hasAdminRights == true) {
			if(!Object.keys(ownedServers).includes(server)) {
				ownedServers[server]=origin;
			}			
		}
		var level = ns.getServerRequiredHackingLevel(attackThis);
		
		if(highestLevelSeen < level) {
			highestLevelSeen = level;
		}
		if(level <= playerLevel &&  ((ns.getServerMaxRam(attackThis) - ns.getServerUsedRam(attackThis)) > (scriptRam) || (ns.getServerMaxRam(attackThis) < Math.ceil(scriptRam) || !ns.getServer(attackThis).backDoorInstalled))) {
           // ns.print(`${crackers} ${ns.getServerNumPortsRequired(attackThis)} ${ns.getServer(attackThis).hasAdminRights}`);
            if(crackers >= ns.getServerNumPortsRequired(attackThis)) {
                if(!ns.getServer(attackThis).hasAdminRights) {
                    if(ns.fileExists("BruteSSH.exe",'home'))
                        ns.brutessh(attackThis);
                    if(ns.fileExists("FTPCrack.exe",'home'))
                        ns.ftpcrack(attackThis);
                    if(ns.fileExists("relaySMTP.exe",'home'))
                        ns.relaysmtp(attackThis);
                    if(ns.fileExists("HTTPWorm.exe",'home'))
                        ns.httpworm(attackThis);
                    if(ns.fileExists("SQLInject.exe",'home'))
		    	        ns.sqlinject(attackThis);
                    if(ns.getServer(attackThis).openPortCount >= ns.getServer(attackThis).numOpenPortsRequired) {
        			    returnResult = ns.nuke(attackThis);
	    		        ownedServers[server]=origin;
		    	        if(!quiet) { ns.print(" ...conquered "+attackThis);                
                        } else {
                            ns.print(`Nuked ${attackThis} level ${ns.getServerRequiredHackingLevel(attackThis)}`);
                            drawLCol(ns,`Nuked ${attackThis} level ${ns.getServerRequiredHackingLevel(attackThis)}`);
                        }
                    }                
                }
                await startHacking(ns,server,target);
            
            /*if(!ns.getServer(attackThis).backDoorInstalled) {
                await ns.connect(attackThis);
                await ns.sleep(100);
                ns.print("Installing backdoor on "+attackThis);
                await ns.installBackdoor();
                await ns.connect('home');
            }*/ //--WORK IN PROGRESS
            
            } else if(crackers < ns.getServerNumPortsRequired(attackThis) && attackThis !== 'darkweb') {
                ns.print(`need ${ns.getServerNumPortsRequired(attackThis)-crackers} more crackers to nuke ${attackThis}`);
                drawLCol(ns,`need ${ns.getServerNumPortsRequired(attackThis)-crackers} more crackers to nuke ${attackThis}`);
            }
		}
		return returnResult;
}

async function startHacking(ns,serv,thisTarget) {

    if(!ns.fileExists("hackit.js",serv)) {
        await ns.scp("hackit.js", serv);
    }
    
    var targetRam = ns.getServerMaxRam(serv);
    var threads = Math.floor(targetRam/Math.ceil(ns.getScriptRam("hackit.js")));
    if(threads < 1) {
        threads = 1;
    }
    var rand = Math.random();
    await ns.sleep(50);
    let startedNewThreads = false;
    let maxSlices = Math.floor((targetRam/scriptRam));
    if( maxSlices > slice) {
        slice = maxSlices;
    }
    for(var s=1;s<=slice;s++) {                   
        let thisThreads = Math.floor(targetRam/slice/scriptRam);
        if(thisThreads < 1) {
            thisThreads = 1;
        }
        if(((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) > scriptRam)) {
            startedNewThreads = true;
            await ns.exec("hackit.js", serv, thisThreads, thisTarget,s);
            await ns.sleep(100);
        }
        
    }
        
    if((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)) >= (scriptRam*extraCopies)) {
        var extraCopies = Math.floor((ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv))/scriptRam);
        if(extraCopies > 0) {            
            if(!quiet)await ns.print("Starting "+extraCopies+" extra hackit threads on "+serv);
            await ns.exec("hackit.js", serv, extraCopies, thisTarget, rand, extraCopies+1);                
        }
    }
    if(startedNewThreads == true) {
        ns.print(`Started hackit.js on [${serv}] attacking [${thisTarget}]`);
        drawLCol(ns,`Started hackit.js on [${serv}] attacking [${thisTarget}]`);
    }
}

async function checkForApps(ns) {
    if(ns.getPlayer()["tor"] == false && ns.getServerMoneyAvailable("home") >= 200000) {
        ns.purchaseTor();
    }
    
    if(!ns.fileExists("BruteSSH.exe",'home') && ns.getServerMoneyAvailable("home") >= 500000) {
        ns.purchaseProgram("BruteSSH.exe");
        ns.toast("Bought BruteSSH");
    }
    if(!ns.fileExists("FTPCrack.exe",'home') && ns.getServerMoneyAvailable("home") >= 1500000) {
        ns.purchaseProgram("FTPCrack.exe");
        ns.toast("Bought FTPCrack");
    }
    if(ns.getPlayer().hacking >= 300 && !ns.fileExists("relaySMTP.exe",'home') && ns.getServerMoneyAvailable("home") >= 5000000) {
        ns.purchaseProgram("relaySMTP.exe");
        ns.toast("Bought relaySMTP");
    }
    if(ns.getPlayer().hacking >= 400 & !ns.fileExists("AutoLink.exe",'home') && ns.getServerMoneyAvailable("home") >= 1500000) {
        ns.purchaseProgram("AutoLink.exe");
        ns.toast("Bought AutoLink");
    }
    if(!ns.fileExists("HTTPWorm.exe",'home') && ns.getServerMoneyAvailable("home") >= 30000000) {
        ns.purchaseProgram("HTTPWorm.exe");
        ns.toast("Bought HTTPWorm");
    }
    if(!ns.fileExists("SQLInject.exe",'home')&& ns.getServerMoneyAvailable("home") >= 250000000) {
        ns.purchaseProgram("SQLInject.exe");
        ns.toast("Bought SQLInject");
    }
    crackers = 0;
    if(ns.fileExists("BruteSSH.exe",'home'))
        crackers++;
    if(ns.fileExists("FTPCrack.exe",'home'))
        crackers++;
    if(ns.fileExists("relaySMTP.exe",'home'))
        crackers++;
    if(ns.fileExists("HTTPWorm.exe",'home'))
        crackers++;
    if(ns.fileExists("SQLInject.exe",'home'))
        crackers++;
}