/** @param {NS} ns **/
export async function main(ns) {

}

export function getItem(ns,key) {
  let item = sessionStorage.getItem(key)
  let result = undefined;
  try {
    result = item ? JSON.parse(item) : undefined
  } catch (except) {
    ns.tprint(except);
  }
   return result;
}

export function setItem(ns,key, value) {
	sessionStorage.setItem(key, JSON.stringify(value))
}

export function clearItem(ns,key) {
	sessionStorage.removeItem(key);
}

export async function getLockAndUpdate(ns,itemName,itemValue) {
	var locked = null;
	let locking = `${itemName}_Locked`;
	locked = getItem(ns,locking);
	if(locked == undefined || locked == null || locked === undefined) {
		setItem(ns,locking,false);
		locked = false;
		await ns.sleep(50);
	}
	while(locked == undefined || locked == null || locked === true) {
		await ns.sleep(50);
		ns.print(`awaiting ${locking} to unlock`);
		locked = getItem(ns,locking);
	}
	setItem(ns,locking,true);
	setItem(ns,itemName,itemValue);
	await ns.sleep(50);
	setItem(ns,locking,false);
	await ns.sleep(50);
}