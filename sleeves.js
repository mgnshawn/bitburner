import { getItem, setItem, getLockAndUpdate, clearItem } from '/_helpers/ioHelpers.js';
import { money } from '/_helpers/helpers.js';
/** @type import(".").NS */
//var ns;
var currentlyRunningSleeves;
var sleeves;
var forcedAction = null;
/** @param {NS} _ns **/
export async function main(_ns) {
    var ns = _ns;
    sleeves = [];
    ns.disableLog('sleep');
    var currentAction = '';
    

    clearItem(ns, 'CommandActionSleeves');
    await ns.sleep(100);
    const validActions = ['maxhack', 'spreadstats', 'crime', 'v', 'showstats','auto'];

    let sleeveCount = ns.sleeve.getNumSleeves();
    for (let a = 0; a < sleeveCount; a++) {
        sleeves.push(ns.sleeve.getInformation(a));
    }
    for (let n in ns.args) {
        if (!validActions.includes(ns.args[n])) {
            ns.tprint(`The only valid options are ${JSON.stringify(validActions)}`);
            ns.exit();
        } ns.tprint(n);
        if (currentlyRunningSleeves && ['showstats','auto','maxhack','spreadstats'].includes(ns.args[n])) {
            setItem(ns, 'CommandActionSleeves', ns.args[(n)]);
            await ns.sleep(100);
            ns.exit();
        }
        if (ns.args[n] == 'maxhack') {
            maxHack(ns);
            forcedAction = ns.args[n];
        }
        if (ns.args[n] == 'spreadstats') {
            spreadStats(ns);
            forcedAction = ns.args[n];
        }
        if (ns.args[n] == 'crime' && (n == 0 && ns.args[1] != undefined)) {
            commitCrime(ns, ns.args[1]);
            forcedAction = ns.args[1];
        }
    }
    ns.tail();
    currentlyRunningSleeves = true;
    while (true) {
        let checkA = checkCommandAction(ns);
        if(checkA != null && checkA != '' && checkA != 'auto') {
            currentAction = checkA;
        }        
        if (forcedAction == null || forcedAction == 'auto') {
            let neededAction = checkAuto(ns);
            if (neededAction != currentAction) {
                ns.print(`Setting to ${neededAction}`);
                switch (neededAction) {
                    case 'spreadstats':
                        spreadStats(ns);
                        break;
                    case 'maxhack':
                        maxHack(ns);
                        break;
                    case 'shockrecovery':
                        shockRecovery(ns);
                        break;
                    default:
                        break;
                }
                currentAction = neededAction;
            }
        }
        await clearItem(ns, 'CommandActionSleeves');
        await ns.sleep(6000);
    }
}
function checkCommandAction(ns) {
    let commandActionSleeves = getItem(ns, 'CommandActionSleeves');
    if (commandActionSleeves !== undefined) {
        if (commandActionSleeves == 'showstats') {
            clearItem(ns, 'CommandActionSleeves');
            showStats(ns);
        }
        if (commandActionSleeves == 'maxhack') {
            clearItem(ns, 'CommandActionSleeves');
            maxHack(ns);
            forcedAction = commandActionSleeves;
        }
        if (commandActionSleeves == 'spreadstats') {
            clearItem(ns, 'CommandActionSleeves');
            spreadStats(ns);
            forcedAction = commandActionSleeves;
        }
        if (commandActionSleeves == 'auto') {
            clearItem(ns, 'CommandActionSleeves');
            forcedAction = 'auto';
        }
    }
    return forcedAction;
}


function showStats(ns) {
    for (let s in sleeves) {
        ns.print(ns.sleeve.getSleeveStats(s));
    }
}

function maxHack(ns) {
    for (let s in sleeves) {
        if (sleeves[s].city != 'Volhaven') {
            ns.sleeve.travel(s, 'Volhaven');
        }
        ns.sleeve.setToUniversityCourse(s, 'ZB Institute of Technology', 'Algorithms');
        ns.print(`Setting Sleeve ${s} to Take Algorithms class`);
    }
}

function spreadStats(ns) {
    let tasks = ['Train Strength', 'Train Defense', 'Train Dexterity', 'Train Agility'];
    for (let s in sleeves) {
        let task = tasks.shift();
        tasks.push(task);
        if (sleeves[s].city != 'Sector-12') {
            ns.sleeve.travel(s, 'Sector-12');
        }
        ns.print(`Setting Sleeve ${s} to ${task}`);
        ns.sleeve.setToGymWorkout(s, 'Powerhouse Gym', task);
    }
}

function shockRecovery(ns) {
    for (let s in sleeves) {
        ns.print(`Setting Sleeve ${s} to ShockRecovery`);
        ns.sleeve.setToShockRecovery(s);
    }
}

function commitCrime(ns, crime) {
    for (let s in sleeves) {
        ns.print(`Setting Sleeve ${s} to Committing ${crime}`);
        ns.sleeve.setToCommitCrime(s, crime);
    }
}

function checkAuto(ns) {
    let actions = ['shockrecovery', 'maxhack'];
    let neededAction = 'spreadstats';
    for (let x in sleeves) {
        let thisSleeve = ns.sleeve.getSleeveStats(x);

        if (thisSleeve.shock > 0) {
            if (thisSleeve.strength > 150) {
                neededAction = actions[0];
            }
        } else {
            neededAction = actions[1];
        }
    }
    return neededAction;
}