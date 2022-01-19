import {setItem,getItem,getLockAndUpdate} from '/_helpers/ioHelpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	var serverName = "";
	if(ns.args[0] !== undefined) {
		serverName = ns.args[0];
	} else {
		ns.exit();
	}
	let serverInfo = null;	
	let serverInfoList = getItem(ns,'serverInfoList');
	
	if(serverInfoList === null || serverInfoList === undefined) {
		ns.print('serverInfoList is null');
		serverInfoList = {};
		await getLockAndUpdate(ns,'serverInfoList',serverInfoList);
		await ns.sleep(5000);
	}
	if(serverName in serverInfoList) {
		ns.print(`serverInfoList already has ${serverName} info. ns.exit()`);
		ns.exit();
	}
		ns.print(`ServerInfoList[${serverName}] is undefined so setting serverInfo`);
		serverInfo = ns.getServer(serverName);
		await ns.sleep(100);
		serverInfoList[serverName] = serverInfo;
		await getLockAndUpdate(ns,'serverInfoList',serverInfoList);
}