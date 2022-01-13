/** @param {NS} ns **/
export async function main(ns) {

}

export function getItem(ns,key) {
  let item = localStorage.getItem(key)
  let result = undefined;
  try {
    result = item ? JSON.parse(item) : undefined
  } catch (except) {
    ns.tprint(except);
  }
   return result;
}

export function setItem(ns,key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}