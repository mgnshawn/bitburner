/** @param {NS} ns **/
export async function main(ns) {

}

export var _allServers = [];
export var _pathToTarget = [];
export async function scan(ns) {
	await localScan(ns,ns.scan("home"),'home');
	return _allServers;
}

async function localScan(ns,targets,parent) {
	for(const a in targets) {
		await ns.sleep(10);
		_allServers.push([targets[a],parent]);
		//ns.tprint(`${parent} => ${targets[a]}`);
		let b = ns.scan(targets[a]);
		let bb = [];
		for(let zz in b) {
			if(b[zz] != parent) {
				bb.push(b[zz]);
			}
		}
		await localScan(ns,bb,targets[a]);			
	}
}

export async function findServerPath(ns,target) {
	_pathToTarget = [];
	await localFindServerPath(ns,target);
	let response=[];
	
	for(let q = _pathToTarget.length-1; q >= 0;q--) {
		response.push(_pathToTarget[q]);
	}
	response.push(target);
	return response;
}
async function localFindServerPath(ns,target) {
	if(_allServers.length == 0) {
		await localScan(ns,ns.scan("home"),'home');
	}
	
	for(let sIndex in _allServers) {
		await ns.sleep(10);
		//ns.tprint(`${_allServers[sIndex][0]} =?= ${target}`);
		if(_allServers[sIndex][0] == target) {
			_pathToTarget.push(_allServers[sIndex][1])
			//ns.tprint(`${target} <== ${_allServers[sIndex][1]}`);
			if(_allServers[sIndex][0] == "home") {
				break;
			}
			await localFindServerPath(ns,_allServers[sIndex][1])
			break;
		}
		
	}
}