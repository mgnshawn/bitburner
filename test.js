var servers = []; //test
/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint(ns.getPurchasedServerLimit());
	ns.tprint(ns.getPurchasedServers());
	let t = {'CSEC':'CyberDic'};
	ns.tprint(ns.getAugmentationsFromFaction('CyberSec'));
	ns.tprint(ns.getServer(Object.keys(t)[0]));
	ns.tprint(`owned augs:::::: ${ns.getOwnedAugmentations()}`);
	ns.tprint(`player info::::::: ${ns.getPlayer()}`);
ns.tprint("---------------------------");
	if(ns.gang.inGang()) {
	let otherGangs = ns.gang.getOtherGangInformation();
	ns.tprint(otherGangs);
	let lowestChance = 1;
	let goToWar = false;
	for (const otherGang in otherGangs) {
		ns.tprint(otherGangs[otherGang]);
	}
	}
	let firstTargets = ns.scan("home");
	var commingFrom = "home";
	/*await scan(ns,firstTargets,'home');
	
	ns.tprint(servers);
	let target = "The-Cave";
		path.push(target);
	await findServerPath(ns,target);
	ns.tprint(path);
	*/
	let s = ns.getPlayer().strength;
	let workingOut = false;
	do {
		if(!workingOut) {
		let tried = ns.gymWorkout('powerhouse gym','strength');
		if(tried)
		workingOut = true;
		else 
		break;
		}
			await ns.sleep(1000);
	} while(ns.getPlayer().strength == s);
	ns.stopAction();
}
var path = [];

async function scan(ns,targets,parent) {

	for(const a in targets) {
		servers.push([targets[a],parent]);
		ns.tprint(`${parent} => ${targets[a]}`);
		let b = ns.scan(targets[a]);
		let bb = [];
		for(let zz in b) {
			if(b[zz] != parent) {
				bb.push(b[zz]);
			}
		}
		await scan(ns,bb,targets[a]);

			
	}
}
async function findServerPath(ns,target) {
	
	for(let sIndex in servers) {
		await ns.sleep(50);
		ns.tprint(`${servers[sIndex][0]} =?= ${target}`);
		if(servers[sIndex][0] == target) {
			path.push(servers[sIndex][1])
			ns.tprint(`${target} <== ${servers[sIndex][1]}`);
			if(servers[sIndex][0] == "home") {
				break;
			}
			await findServerPath(ns,servers[sIndex][1])
			break;
		}
		
	}
}