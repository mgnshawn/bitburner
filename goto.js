import { travelToServer} from '/helpers.js';
/** @param {NS} ns **/
export async function main(ns) {
var destination = ns.args[0];
var backWard = false;
var showOnly = false;
var pathing = [];
if(!showOnly) {
ns.tprint(pathing =await travelToServer(ns,destination));
} else {
}
for(let serv of pathing) {
ns.connect(serv);
}
}