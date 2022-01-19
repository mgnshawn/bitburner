import { travelToServer, getServers } from '/helpers.js';
/** @param {NS} ns **/
export async function main(ns) {
	var onlyShow = false;
	var destination = null;
	ns.args.forEach(a => {
		if (a == "nogo") {
			onlyShow = true;
		} else {
			destination = a;
		}
	});
	var backWard = false;
	var pathing = [];
	const servers = getServers(ns, false);
	const server = servers.find(({ name }) => name === destination)
	if (onlyShow) {
		ns.tprint(server.path);
	} else {
		ns.tprint(pathing = await travelToServer(ns, destination));
		for (let serv of server.path) {
			ns.connect(serv);
		}
	}
}