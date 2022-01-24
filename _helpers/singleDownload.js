const baseUrl = 'https://raw.githubusercontent.com/mgnshawn/bitburner/master/';
export async function main(ns) {
    let getAddr = (baseUrl+ns.args[0] + '?ts=' + new Date().getTime());
    ns.tprint(`Downloading: ${getAddr}`);
    await ns.wget(getAddr, ns.args[0]);
    await ns.sleep(2000);
}