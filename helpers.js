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
	ns.tprint(_allServers);
	return _allServers;
}

function localScan(ns, targets, parent) {
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
		localScan(ns, bb, targets[a]);
	}
}

export async function travelToServer(ns, server) {
	let serverPath = findServerPath(ns, server);
	for (let server of serverPath) {
		ns.run('/_scriptRamHelpers.js',1,server);
		await ns.sleep(100);
	}
}
export async function travelBackHome(ns, server) {
	let serverPath = findServerPath(ns, server);
	for (let a = serverPath.length - 1; a >= 0; a--) {
		ns.run('/_scriptRamHelpers.js',1,a);
		await ns.sleep(100);
	}

}

/**
 * @param {ns} ns NS object
 * @param {string} target desired server to find
 * @returns {Array}
 */
export function findServerPath(ns, target) {
	let servers = getServers(ns, true);
	const server = servers.find(({ name }) => name === target)
	return server.path;
}

export function chooseTarget(ns, hackingLevel, currentMemmoryLevel) {
	let resp = {};
	let memmoryLevels = [8, 32, 128, 256, 1024, 2048, 4096, 16384, 32768, (128 * 1024), (512 * 1024), (1024 * 1024)];
	if (hackingLevel < 50) {
		resp = { "target": "n00dles", "slice": 1, "rungGang": false, "ram": 8 };
	} else if (50 <= hackingLevel && hackingLevel < 150) {
		resp = { "target": "joesguns", "slice": 4, "rungGang": false, "ram": 8 };
	} else if (150 <= hackingLevel && hackingLevel < 500) {
		resp = { "target": "iron-gym", "slice": 8, "runGang": true, "ram": 8 };
	} else if (500 <= hackingLevel && hackingLevel < 1350) {
		resp = { "target": "catalyst", "slice": 16, "runGang": true, "ram": 8 };
	} else {
		resp = { "target": "megacorp", "slice": 60, "runGang": true, "ram": 8 };
	}
	resp.ram = currentMemmoryLevel;
	for (let m in memmoryLevels) {
		if (currentMemmoryLevel == undefined) {
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
	if (resp.ram >= 32) {
		multiplier = 8;
	}
	if (resp.ram >= 128) {
		multiplier = 10;
	}
	if (resp.ram >= 256) {
		multiplier = 16;
	}
	if (resp.ram >= 1024) {
		multiplier = 32;
	}
	if (resp.ram >= 4096) {
		multiplier = 64;
	}
	if (resp.ram >= 16384) {
		multiplier = 128;
	}
	if (resp.ram >= 32768) {
		multiplier = 256;
	}
	if (resp.ram >= (128 * 1024)) {
		multiplier = 512;
	}
	if (resp.ram >= (512 * 1024)) {
		multiplier = 1024;
	}
	if (resp.ram >= (1024 * 1024)) {
		multiplier = 1538;
	}
	resp.slice = multiplier;
	return resp;
}

let svObj = (name = 'home', depth = 0, path = "") => ({ name: name, depth: depth, path: path });
export function getServers(ns, withConnect = true) {
	let result = [];
	let visited = { 'home': 0 };
	let queue = Object.keys(visited);
	let name;
	while ((name = queue.pop())) {
		let depth = visited[name];

		// @TODO better variable names
		var pathToTarget = [];
		let paths = { "home": "" };
		let queue1 = Object.keys(paths);
		let name1;

		/* For producing the path to the server
		@TODO remove as most of this is already done by its parent function
		*/
		while ((name1 = queue1.shift())) {
			let path = paths[name1];
			let scanRes = ns.scan(name1);
			for (let newSv of scanRes) {
				if (paths[newSv] === undefined) {
					queue1.push(newSv);
					paths[newSv] = `${path},${newSv}`;
					if (newSv == name) {
						pathToTarget = paths[newSv].substr(1).split(",");
					}
				}
			}
		}
		let pre = "";
		let post = "";
		if (withConnect) {
			pre = "connect ";
			post = ";";
		}
		const path = pathToTarget.map(server => pre + server + post);
		result.push(svObj(name, depth, path));
		let scanRes = ns.scan(name);
		for (let i = scanRes.length; i >= 0; i--) {
			if (visited[scanRes[i]] === undefined) {
				queue.push(scanRes[i]);
				visited[scanRes[i]] = depth + 1;
			}
		}
	}
	return result;
}