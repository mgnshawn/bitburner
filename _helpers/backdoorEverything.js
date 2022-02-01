import { travelToServer, travelBackHome, scan } from '/_helpers/helpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	let servers = await scan(ns);
	ns.tprint(servers);
	for (let serv in servers) {
		if (ns.getServer(servers[serv][0]).hasAdminRights) {
			if (!ns.getServer(servers[serv][0]).backdoorInstalled) {
				if (!ns.getPurchasedServers().includes(servers[serv][0]) && ns.getServerRequiredHackingLevel(servers[serv][0]) <= ns.getPlayer().hacking) {
					await travelToServer(ns, servers[serv][0]);
					await ns.sleep(200);
					await ns.installBackdoor();
					ns.tprint(`\tBackdoored ${servers[serv][0]}`);
					
					await ns.sleep(100);
					await travelBackHome(ns, servers[serv][0]);
					await ns.sleep(200);
				}
			} else {
				ns.tprint(`\t already backdoored on ${servers[serv][0]}`);
			}
		}
		else {
			ns.tprint(`no rights to ${servers[serv][0]}`);
		}
	}
}