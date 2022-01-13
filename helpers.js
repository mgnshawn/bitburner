/** @param {NS} ns **/
export async function main(ns) {

}
export function money(num) {
	return Math.round(num).toLocaleString('en-US');
}

export var _allServers = [];
export var _pathToTarget = [];
export async function scan(ns) {
	_allServers = [];
	await localScan(ns, ns.scan("home"), 'home');
	return _allServers;
}

async function localScan(ns, targets, parent) {
	for (const a in targets) {
		await ns.sleep(10);
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

export async function findServerPath(ns, target) {
	_pathToTarget = [];
	await localFindServerPath(ns, target);
	let response = [];

	for (let q = _pathToTarget.length - 1; q >= 0; q--) {
		response.push(_pathToTarget[q]);
	}
	response.push(target);
	return response;
}
async function localFindServerPath(ns, target) {
	if (_allServers.length == 0) {
		await localScan(ns, ns.scan("home"), 'home');
	}

	for (let sIndex in _allServers) {
		await ns.sleep(10);
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

	}
}

export function chooseTarget(ns, hackingLevel, currentMemmoryLevel) {
	let resp = {};
	let memmoryLevels = [8, 32, 256, 1024, 2048, 4096, 16384, 32768, (128 * 1024), (512 * 1024), (1024 * 1024)];
	if (hackingLevel < 100) {
		resp = { "target": "n00dles", "slice": 1, "rungGang": false, "ram": 8 };
	} else if (100 <= hackingLevel && hackingLevel < 350) {
		resp = { "target": "joesguns", "slice": 4, "rungGang": false, "ram": 8 };
	} else if (350 <= hackingLevel && hackingLevel < 1000) {
		resp = { "target": "iron-gym", "slice": 8, "runGang": true, "ram": 8 };
	} else if (1000 <= hackingLevel && hackingLevel < 1350) {
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
	for (let r in memmoryLevels) {
		if (memmoryLevels[r] == resp.ram) {
			resp.slice = (parseInt(r,10) + 1) * 8
		}
	}
	return resp;
}