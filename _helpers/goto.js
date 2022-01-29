import { travelToServer, getServers } from '/_helpers/helpers.js';
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
		(pathing = await travelToServer(ns, destination));
		for (let serv of server.path) {
			ns.connect(serv);
		}
	}
}