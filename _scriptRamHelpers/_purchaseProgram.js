// args Ram, Slices, Target
export async function main(ns) {
    if(ns.args[0] !== undefined) {
        ns.purchaseProgram(ns.args[0]);
        await ns.sleep(1000);
    }
}