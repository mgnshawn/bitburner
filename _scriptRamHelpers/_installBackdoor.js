import {setItem} from '/ioHelpers.js';
export async function main(ns) {
    let result = false;
    let = ns.installBackdoor();
    await s.sleep(100);
    setItem(ns,'backdoorInstallResult',result);
    await ns.sleep(100);
}