import {drawLCol} from '/terminal.js';
const baseUrl = 'https://raw.githubusercontent.com/mgnshawn/bitburner/master/';
export async function main(ns) {
    await ns.wget(baseUrl+ns.args[0] + '?ts=' + new Date().getTime(), ns.args[0]);
    await ns.sleep(2000);
}