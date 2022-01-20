import {drawDoing, clearDoingLine} from '/terminal.js';
import {getItem}from '/_helpers/ioHelpers.js';
var infinite=false;
var crimes=['Shoplift','Rob store','Mug someone','Homicide','Kidnap and ransom','Assassinate','Heist'];
/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('sleep');
    ns.disableLog('run');
    ns.print("===================== Beginning CrimeItUp =====================");
    var remainder = 90;
    var runByMoney = false;
    var growthTarget = 0;
    var growthRemaining = 0;
    var crimeWin = 1000;
    var autoCrime = false;
    var baseRemainder = 90;
	 if(ns.args[0] !== undefined && (ns.args[0] == "-h" || ns.args[0] == '-?')) {
        await ns.tprint("Crime it up: auto||(1:shoplift,2:Rob store,3:Mug someone,4:Homicide,4A:Homicide+Assassinate) optional:moneyRun optional(l longterm, s shortterm, N=run 50 loops, forever but pause 4 seconds so you can kill it");
        await ns.tprint("Option: MoneyRun:: specifies to run for X dollars of growth");
        ns.exit();
    }
    if(ns.args[0] !== undefined && ns.args[1] !== undefined) {
        if(ns.args[1] == 'l') {
            infinite = true;
        } else if(ns.args[1] == 's') {
            baseRemainder = 15;
        } else if(ns.args[2] !== undefined && ns.args[2] == 'l') {
            infinite = true;
        } else if(ns.args[2] !== undefined && ns.args[2] == 's') {
            baseRemainder = 15;
        }
    } else {
        infinite = false;
    }
    if(ns.args[1] !== undefined && ns.args[1] !== 'l' && ns.args[1] !== 's') {
        growthTarget = growthRemaining = ns.args[1]+ns.getServerMoneyAvailable("home");
        runByMoney = true;

    }
    var crime = "Shoplift";
    if(ns.args[0] !== undefined) {
    switch(ns.args[0]) {
        case "2":
        case 2:
        crime = "Rob store";
        remainder = baseRemainder = (baseRemainder/15);
        crimeWin = 141000;
        break;
        case "3":
        case 3:
        crime = "Mug someone";
        crimeWin = 12000;
        break;
        case "4":
        case 4:
        crime = "Homicide";
        crimeWin = 15000;
        break;
        case "4A":
        crime = "Homicide";
        crimeWin = 15000;
        break;
        case "auto":
        autoCrime = true;
        crime=await chooseBestCrime(ns);
        ns.print("Performing "+crime);
        break;
    }
    }
    if(crime == "Assassinate" || crime == "Heist") {
        remainder = baseRemainder = 1;
    }
	while((infinite) || (remainder > 0) && (!runByMoney || (ns.getServerMoneyAvailable('home') < growthTarget))) {
        if(autoCrime) {
            crime = await chooseBestCrime(ns);
        }
		if(!ns.isBusy()) {
            drawDoing(ns,`Commiting ${crime}`);            
            ns.tail(); // Force a tail window open when auto-criming, or else it's very difficult to stop if it was accidentally closed.
            ns.run('/_scriptRamHelpers/_commitCrime.js',1,crime);
            let wait = getItem(ns,`commitCrime_${crime}_wait`);
            --remainder;
            
            await ns.sleep(wait+250);
        }
        await ns.sleep(100);
        if(infinite) {
            if(remainder == 0) {
                ns.toast("Resuming in  5");
                await ns.sleep(5000);
                remainder = baseRemainder;
            }
        }
        clearDoingLine(ns);
    }
    clearDoingLine(ns);
    ns.enableLog('sleep');
}

async function chooseBestCrime(ns) {
    let threshold = .75;
    let crimeChoice = "Shoplift";
    for(let a = 0;a < crimes.length; a++) {
        ns.run('_scriptRamHelpers/_getCrimeChance.js',1,crimes[a]);
        await ns.sleep(100);
        let crimeChance = getItem(ns,`crime_${crimes[a]}_chance`);
        if(crimeChance >= threshold) {
            crimeChoice = crimes[a];
        }
    }
    return crimeChoice;    
}