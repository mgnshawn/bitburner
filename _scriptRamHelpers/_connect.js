import { setItem } from '/_helpers/ioHelpers.js';

// args Ram, Slices, Target
export async function main(ns) {
    if(ns.args[0] !== undefined) {
        ns.connect(ns.args[0]);
        await ns.sleep(500);
        if(ns.getCurrentServer() == ns.args[0]) {
            setItem(ns,'connectResult',true);
        } else {
            setItem(ns,'connectResult', false);
        }
    }
}