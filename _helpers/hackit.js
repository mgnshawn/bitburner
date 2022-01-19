import { getItem, setItem, getLockAndUpdate } from '/ioHelpers.js';
export async function main(ns) {
    if(ns.args[0] == undefined) {
        ns.print(`No target.. Exit()`);
        ns.exit()
    }
    var target = ns.args[0];
    ns.print(`target: ${target}`);    
    let ptol = getItem(ns,'portsToOpenList');
    if(ptol == null|| ptol === undefined) {
        ptol = [];           
    }
    ptol.push(target);
    await getLockAndUpdate(ns,'portsToOpenList',ptol);
    ns.print(`pushing ${target} to PortsToOpenList`);
    await ns.sleep(3000);
    var serverInfoList = getItem(ns, 'serverInfoList');
    ns.print(serverInfoList);
    if (serverInfoList !== null) {
        if(serverInfoList[target] != undefined) { 
            ns.print('in list');
        } else {
           ns.print(`Service info list exists but missing key ${target}`);
           ns.exit(); 
        }
        var moneyThresh = serverInfoList[target].moneyMax * 0.75;
        var moneyAvailable = serverInfoList[target].moneyAvailable;
        ns.print("max money: " + serverInfoList[target].moneyMax);
        ns.print("now money: " + serverInfoList[target].moneyAvailable);
        var securityThresh = serverInfoList[target].minDifficulty + 4;

        while (true) {
            serverInfoList = getItem(ns, 'serverInfoList');
            if (serverInfoList[target].hackDifficulty > securityThresh) {
                await ns.weaken(target, 1);
            } else if (serverInfoList[target].moneyAvailable < moneyThresh) {
                await ns.grow(target, 1);
            } else {
                await ns.hack(target, 1);
            }
            await ns.sleep(1000);
        }
    } else {
        ns.print('FAILED TO GET/SET serverInfoList.  exit()');
        ns.exit();
    }
}