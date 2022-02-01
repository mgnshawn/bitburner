const baseUrl = 'http://localhost:8100/status';
export async function main(ns) {
    let getAddr = (baseUrl);
    ns.tprint(`Downloading: ${getAddr}`);
    await ns.wget(getAddr, 'testdata.txt');
    await ns.sleep(2000);
    let reqData = await ns.read('testdata.txt');
    let statusObj = JSON.parse(reqData);
    ns.tprint(statusObj.status[0]);
}