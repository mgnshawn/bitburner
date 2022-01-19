import { setItem } from '/ioHelpers.js';

// args Ram, Slices, Target
export async function main(ns) {
    let server = ns.getCurrentServer();
    ns.setItem('currentServer', server);
    await ns.sleep(500);
}