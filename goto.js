import { travelToServer } from '/helpers.js';
/** @param {NS} ns **/
export async function main(ns) {
var destination = ns.args[0];
var pathing = [];
ns.tprint(pathing = travelToServer(ns,destination));
for(let serv of pathing) {
ns.connect(serv);
}
}