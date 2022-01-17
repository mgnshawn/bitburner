/** @param {NS} ns **/
export async function main(ns) {
	for(let a in ns.args) {
		if(ns.args[a] == "scan" && ns.args[a+1] !== undefined) {
			await ns.sleep(1000);
			ns.tprint(await findServerPath(ns,ns.args[1]));
		}
	}
}
export function money(num) {
	return Math.round(num).toLocaleString('en-US');
}

export var _allServers = [];
export var _pathToTarget = [];

export async function scan(ns) {
	ns.tprint('Scanning..');
	_allServers = [];
	await localScan(ns, ns.scan("home"), 'home');
	ns.print(_allServers);
	return _allServers;
}

async function localScan(ns, targets, parent) {
	for (const a in targets) {
		//await ns.sleep(10);
		_allServers.push([targets[a], parent]);
		//ns.tprint(`${parent} => ${targets[a]}`);
		let b = ns.scan(targets[a]);
		let bb = [];
		for (let zz in b) {
			if (b[zz] != parent) {
				bb.push(b[zz]);
			}
		}
		await localScan(ns, bb, targets[a]);
	}
}

export async function travelToServer(ns, server) {
let pathing = await findServerPath(ns, server);
await ns.sleep(100);
ns.tprint(pathing);
for(let a = 0; a < pathing.length; a++) {
	ns.connect(pathing[a]);
	await ns.sleep(100);
}
return pathing;
}
export async function travelBackHome(ns, server) {
let pathing = await findServerPath(ns, server);
ns.tprint(pathing);
for(let a = pathing.length-1;a>=0;a--) {
		ns.connect(pathing[a]);
		await ns.sleep(100);
}

return pathing;
}

/**
 * @param {ns} ns NS object
 * @param {string} target desired server to find
 * @returns {Array}
 */
export async function findServerPath(ns, target) {
	_pathToTarget = [];
	await localFindServerPath(ns, target);
	let response = [];

	for (let q = _pathToTarget.length - 1; q >= 0; q--) {
		response.push(_pathToTarget[q]);
	}
	response.push(target);
	ns.tprint(response);
	await ns.sleep(100);
	return response;
}
async function localFindServerPath(ns, target) {
	if (_allServers.length == 0) {
		localScan(ns, ns.scan("home"), 'home');
	}

	for (let sIndex in _allServers) {
//		await ns.sleep(10);
		//ns.tprint(`${_allServers[sIndex][0]} =?= ${target}`);
		if (_allServers[sIndex][0] == target) {
			_pathToTarget.push(_allServers[sIndex][1])
			//ns.tprint(`${target} <== ${_allServers[sIndex][1]}`);
			if (_allServers[sIndex][0] == "home") {
				break;
			}
			await localFindServerPath(ns, _allServers[sIndex][1])
			break;
		}
		await ns.sleep(10);
	}
}

export function chooseTarget(ns, hackingLevel, currentMemmoryLevel) {
	let resp = {};
	let memmoryLevels = [8, 32, 128, 256, 1024, 2048, 4096, 16384, 32768, (128 * 1024), (512 * 1024), (1024 * 1024)];
	if (hackingLevel < 50) {
		resp = { "target": "n00dles", "slice": 1, "rungGang": false, "ram": 8 };
	} else if (50 <= hackingLevel && hackingLevel < 120) {
		resp = { "target": "joesguns", "slice": 4, "rungGang": false, "ram": 8 };
	} else if (120 <= hackingLevel && hackingLevel < 450) {
		resp = { "target": "iron-gym", "slice": 8, "runGang": true, "ram": 8 };
	} else if (450 <= hackingLevel && hackingLevel < 1350) {
		resp = { "target": "catalyst", "slice": 16, "runGang": true, "ram": 8 };
	} else {
		resp = { "target": "megacorp", "slice": 60, "runGang": true, "ram": 8 };
	}
	resp.ram = currentMemmoryLevel;
	for (let m in memmoryLevels) {
		if(currentMemmoryLevel == undefined) {
			currentMemmoryLevel = 16;
		}
		if (memmoryLevels[m] < currentMemmoryLevel) {
			continue;
		}

		if (ns.getPurchasedServerCost(memmoryLevels[m]) !== undefined && !isNaN(ns.getPurchasedServerCost(memmoryLevels[m]))) {
			if (ns.getPurchasedServerCost(memmoryLevels[m]) < (ns.getServerMoneyAvailable('home') / 3)) {
				continue;
			} else {
				if (memmoryLevels[m + 1] == undefined || isNaN(ns.getPurchasedServerCost(memmoryLevels[m + 1]))) {
					resp.ram = memmoryLevels[m];
					break;
				} else {
					if (ns.getPurchasedServerCost(memmoryLevels[m + 1]) > (1.3 * ns.getServerMoneyAvailable('home'))) {
						resp.ram = memmoryLevels[m];
						break;
					}
				}
			}
		}
	}
			let multiplier = 8;
			if(resp.ram >= 32) {
				multiplier = 8;
			}
			if(resp.ram >= 128) {
				multiplier = 10;
			}
			if(resp.ram >= 256) {
				multiplier = 16;
			}
			if(resp.ram >= 1024) {
				multiplier = 32;
			}
			if(resp.ram >= 4096 ) {
				multiplier = 64;
			}
			if(resp.ram >= 16384 ) {
				multiplier = 128;
			}
			if(resp.ram >= 32768) {
				multiplier = 256;
			}
			if(resp.ram >= (128*1024) ) {
				multiplier = 512;
			}
			if(resp.ram >= (512*1024) ) {
				multiplier = 1024;
			}
			if(resp.ram >= (1024*1024) ) {
				multiplier = 1538;
			}
			resp.slice = multiplier;
	return resp;
}
