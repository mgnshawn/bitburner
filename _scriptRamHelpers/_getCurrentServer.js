import { setItem } from '/_helpers/ioHelpers.js';

// args Ram, Slices, Target
export async function main(ns) {
    let server = ns.getCurrentServer();
    setItem(ns,'currentServer', server);
    await ns.sleep(500);
}