export async function main(ns) {
var target = ns.args[0];
ns.print("target: "+ns.args[0]);
var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
ns.print("max money: "+ns.getServerMaxMoney(target));
ns.print("now money: "+ns.getServerMoneyAvailable(target));
var securityThresh = ns.getServerMinSecurityLevel(target) + 4;

if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
}

if (ns.fileExists("FTPCrack.exe","home")) {
    ns.ftpcrack(target);
}

if (ns.fileExists("HTTPWorm.exe", "home")) {
    ns.httpworm(target);
}

if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(target);
}

if (ns.fileExists("SQLInject.exe", "home")) {
    ns.sqlinject(target);
}
ns.nuke(target);

while(true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
        await ns.weaken(target,1);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
        await ns.grow(target,1);
    } else {
        await ns.hack(target,1);
    }
    await ns.sleep(100);
}
}
