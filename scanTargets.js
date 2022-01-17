var targets = [];
var _allServers = [];
/** @param {NS} ns **/
export async function main(ns) {

let listT = await scan(ns);
for(let l=0;l < _allServers.length; l++) {
	let ps = ns.getPurchasedServers();
	if(ps.includes(_allServers[l][0]) || _allServers[l][0] == 'home') {
		continue;
	}
	await targets.push({'name':_allServers[l][0],'maxMoney':ns.getServerMaxMoney(_allServers[l][0]),'currentMoney':ns.getServerMoneyAvailable(_allServers[l][0]),'minSecurity':ns.getServerMinSecurityLevel(_allServers[l][0]),'level':ns.getServerRequiredHackingLevel(_allServers[l][0])});
}

targets.sort((a, b) => a.maxMoney - b.maxMoney);
drawList(ns);
}

function drawList(ns) {
	const row = '%-20s | %8s | %12s | %12s';
ns.tprintf(row, 'HOSTNAME', 'HACK LVL', 'MIN SEC', 'MAX $$', 'CASH $$');
ns.tprintf(row, '---------', '-------', '------', '------', '-------');
for (const target of targets) {
    ns.tprintf(row, target.name,
        ns.nFormat(target.level,	'0,0'),
		ns.nFormat(target.minSecurity,	'0,0'),
        ns.nFormat(target.maxMoney,'($ 0.00 a)'),
        ns.nFormat(target.currentMoney,'($ 0.00 a)')
        );
}
}


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