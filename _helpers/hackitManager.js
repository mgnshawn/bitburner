import { getItem, setItem, getLockAndUpdate } from '/_helpers/ioHelpers.js';
var currentServer = "";
export async function main(ns) {
    if (ns.args[0] == undefined) {
        ns.print(`No target.. Exit()`);
        ns.exit()
    }
    if(ns.args[1] == undefined && ns.getCurrentServer() != 'home') {
        ns.print('Current server not defined');
        ns.exit
    } else if (ns.args[1] == undefined && ns.getCurrentServer == 'home') {
        currentServer = 'home';
    } else {
        currentServer = ns.args[1];
    }
    var target = ns.args[0];
    ns.print(`target: ${target}`);
    let ptol = getItem(ns, 'portsToOpenList');
    if (ptol == null || ptol === undefined) {
        ptol = [];
    }
    ptol.push(target);
    await getLockAndUpdate(ns, 'portsToOpenList', ptol);
    ns.print(`pushing ${target} to PortsToOpenList`);
    await ns.sleep(3000);
    ns.print(`${ns.getServerMaxRam(target)} - ${ns.getServerUsedRam(target)} - ${ns.getScriptRam('/_helpers/hackitManager.js')}) / ${ns.getScriptRam('/_helpers/hackit_weaken.js')}`);
    ns.print(`${Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target) - ns.getScriptRam('/_helpers/hackitManager.js')) / ns.getScriptRam('/_helpers/hackit_weaken.js'))}`);
    var threadCount = Math.floor((ns.getServerMaxRam(currentServer) - ns.getScriptRam('/_helpers/hackitManager.js')) / ns.getScriptRam('/_helpers/hackit_weaken.js'));
    if(currentServer == 'home') {
        threadCount -= 15;
    }
    if (threadCount <= 0) {
        ns.print('Not enough free ram');
        ns.exit();
    }
    ns.print(`ThreadCount :${threadCount}`);
    var serverInfo = { 'hack': { 'threshold': 0 }, 'grow': { 'threshold': .75 }, 'weaken': { 'threshold': 4 }, 'threadCount': 0 };
    var actionTime = 1234;
    var thisServer = ns.getCurrentServer();
    serverInfo.threadCount = threadCount;
    var action = getItem(ns, `hackit_${thisServer}_action`);
    action = 'manage';
    let securityThreshold = ns.getServerMinSecurityLevel(target) + serverInfo.weaken.threshold;
    let growThreshold = ns.getServerMaxMoney(target) * serverInfo.grow.threshold;
    while (true) {
        if (action === undefined) {
            setItem(ns, `hackit_${thisServer}_action`, 'manage');
        }
        if (action == 'manage') {
            let securityLevel = ns.getServerSecurityLevel(target);
            let moneyAvailable = ns.getServerMoneyAvailable(target);

            if (securityLevel > securityThreshold) {
                action = 'weaken';
                setItem(ns, `hackit_${thisServer}_action`, action);
                ns.run('/_helpers/hackit_weaken.js', threadCount, target, thisServer)
                actionTime = ns.getWeakenTime(target) + 100;
            } else if (moneyAvailable < growThreshold) {
                action = 'grow';
                setItem(ns, `hackit_${thisServer}_action`, action);
                ns.run('/_helpers/hackit_grow.js', threadCount, target, thisServer)
                actionTime = ns.getGrowTime(target) + 100;
            }
            else {
                action = 'hack';
                setItem(ns, `hackit_${thisServer}_action`, action);
                ns.run('/_helpers/hackit_hack.js', threadCount, target, thisServer)
                actionTime = ns.getHackTime(target) + 100;
            }
            await ns.sleep(Math.ceil(actionTime));
        }
        action = getItem(ns, `hackit_${thisServer}_action`);

        await ns.sleep(1000);
    }
}