import { getItem, setItem, getLockAndUpdate } from '/ioHelpers.js';
/** @param {NS} ns **/
export async function main(ns) {
    ns.tail();
    ns.disableLog('sleep');
    while (true) {
        await ns.sleep(1000);
        let portsToOpenList = getItem(ns, 'portsToOpenList');
        let target = null;
        if (portsToOpenList == null || portsToOpenList === undefined) {
            portsToOpenList = [];
            await getLockAndUpdate(ns,'portsToOpen',portsToOpenList);
            await ns.sleep(500);
        } else {
            target = portsToOpenList.shift();
        }
        if (target !== null && target !== undefined) {
            ns.print(`New target ${target}`);
            var serverInfoList = getItem(ns, 'serverInfoList');            
            if(serverInfoList == null || serverInfoList[target] == undefined || serverInfoList[target] == null) {
                ns.print(`Running _setServerInfo`);
                await ns.run('/_scriptRamHelpers/_setServerInfo.js',1,target);
                await ns.sleep(2000);    
	        }
	        await ns.sleep(100);
	        
            if (ns.fileExists("BruteSSH.exe", "home")) {
                ns.brutessh(target);
            }

            if (ns.fileExists("FTPCrack.exe", "home")) {
                ns.ftpcrack(target);
            }

            if (ns.fileExists("HTTPWorm.exe", "home")) {
                ns.httpworm(target);
            }

            if (ns.fileExists("relaySMTP.exe", "home")) {
                ns.relaysmtp(target);
            }

            if (ns.fileExists("SQLInject.exe", "home")) {
                ns.sqlinject(target);
            }
            ns.nuke(target);
            await getLockAndUpdate(ns,'portsToOpen',portsToOpenList);
            await ns.sleep(500);
            await getLockAndUpdate(ns,'portsToOpenList', portsToOpenList);
            target = null;
            await ns.sleep(250);
        }
    }
}