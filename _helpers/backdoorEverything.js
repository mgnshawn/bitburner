import { travelToServer, travelBackHome, scan } from '/_helpers/helpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	let servers = await scan(ns);
	ns.tprint(servers);
	for (let serv in servers) {
		if (ns.getServer(servers[serv][0]).hasAdminRights) {
			if(!ns.getServer(servers[serv][0]).backdoorInstalled) {
			await travelToServer(ns, servers[serv][0]);
			await ns.sleep(1000);
			await ns.sleep(100);
			let res = await ns.installBackdoor();
			if(res) {
				ns.tprint(`\tINSTALLED on ${servers[serv][0]}`);
			}
			await ns.sleep(100);
			await travelBackHome(ns, servers[serv][0]);
			await ns.sleep(1000);
			} else {
				ns.tprint(`\t already backdoored on ${servers[serv][0]}`);
			}
		}
	 else {
		ns.tprint(`no rights to ${servers[serv][0]}`);
	}
	}
}