/** @param {NS} ns **/
export async function main(ns) {

}

export function getItem(ns,key) {
  let item = localStorage.getItem(key)
   let result = item ? JSON.parse(item) : undefined
   return result;
}

export function setItem(ns,key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}