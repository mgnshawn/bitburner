import { getItem, setItem, getLockAndUpdate } from '/_helpers/ioHelpers.js';
export async function main(ns) {
    if(ns.args[0] == undefined) {
        ns.print(`No target.. Exit()`);
        ns.exit()
    }
    var target = ns.args[0];
    var thisServer = ns.args[1];
            await ns.grow(target);
            setItem(ns, `hackit_${thisServer}_action`, "manage");
}