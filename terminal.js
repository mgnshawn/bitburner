import {getItem, setItem} from '/ioHelpers.js';
var termHeight = 28;
var termWidth = 220;
var topBufferLines = 16;
var stateLines = 3;
var lColumnChars = 100;


export function drawList1(ns,newLine) {
	if(newLine === null) {
		return;
	}
	let t = new Date();
		let hours = ('0' + t.getHours()).slice(-2);
		let minutes = ('0' + t.getMinutes()).slice(-2);
		let seconds = ('0' + t.getSeconds()).slice(-2);
		let bufferList = getItem(ns,'bufferList');
		if(bufferList == undefined) {
			bufferList = [];
		}
	if(bufferList.length >= topBufferLines) {
		bufferList.shift();
		bufferList.push([` ${hours}:${minutes}:${seconds} `,newLine]);
		}else {
			bufferList.push([` ${hours}:${minutes}:${seconds} `,newLine]);
		}
		setItem(ns,'bufferList',bufferList);
	 //draw(ns);
}
export function drawStatus1(ns,newLine) {
	if(newLine === null) {
		return;
	}
	let t = new Date();
		let hours = ('0' + t.getHours()).slice(-2);
		let minutes = ('0' + t.getMinutes()).slice(-2);
		let seconds = ('0' + t.getSeconds()).slice(-2);
		let status1 = getItem(ns,'statusList');
		if(status1 == undefined) {
			status1 = [];
		}
	if(status1.length >= stateLines) {
		status1.pop();
		status1.unshift([` ${hours}:${minutes}:${seconds} `,newLine]);
		}else {
			status1.unshift([` ${hours}:${minutes}:${seconds} `,newLine]);
		}
	setItem(ns,'statusList',status1);
	 //draw(ns);
}
export function drawLCol(ns,newLine) {
	if(newLine === null) {
		return;
	}ns.tprint(`adding: ${newLine}`);
	let t = new Date();
		let hours = ('0' + t.getHours()).slice(-2);
		let minutes = ('0' + t.getMinutes()).slice(-2);
		let seconds = ('0' + t.getSeconds()).slice(-2);
		let status2 = getItem(ns,'status2List');
		if(status2 == undefined) {
			status2 = [];
		}
	if(status2.length >= (termHeight-2)) {
		status2.pop();
		status2.unshift([` ${hours}:${minutes}:${seconds} `,newLine]);
		}else {
			status2.unshift([` ${hours}:${minutes}:${seconds} `,newLine]);
		}
		setItem(ns,'status2List',status2);
		ns.tprint(status2);
	 //draw(ns);
}
export function clearLCol(ns) {
	setItem(ns, 'status2List', []);
}
 function draw(ns) {
	 	let status1 = getItem(ns,'statusList');
		 let status2 = getItem(ns,'status2List');
		 let bufferList = getItem(ns,'bufferList');
		ns.clearLog();
	
		let listLines = [];
		let stateListLines = [];
		let lColListLines = [];

		for(let _z = 1;_z<=topBufferLines;_z++) {
			listLines.push(_z);
		}
		for(let _z = termHeight - 1; _z > 0;_z--) {
			lColListLines.push(_z);
		}
		for(let _x=termHeight-1; _x > 0; _x--) {
			if(_x <=termHeight-2 && _x >= termHeight-stateLines-1) {
				stateListLines.push(_x);
			} else {
				stateListLines.push(0);
			}
		}


		for(let y= 0;y<termHeight;y++) {	
			let CurrLine = "";		
			if(y in listLines) {
				if(bufferList !== null && Array.isArray(bufferList) && bufferList[y-1] !== undefined && bufferList[y-1][1] !== undefined)
				bufferList[y-1][1] = bufferList[y-1][1].toString().replace(/\t/g, `    `);
			}
			if(y in stateListLines) {
				if(status1[y-1] !== undefined && status1[y-1][1] !== undefined)
				status1[y-1][1] = status1[y-1][1].toString().replace(/\t/g, `    `);
			}
			if(y in lColListLines) {
				if(status2[y-2] !== undefined && status2[y-2][1] !== undefined)
				status2[y-2][1] = status2[y-2][1].toString().replace(/\t/g, `    `);
			}
			for(let x =0; x < termWidth;x++) {
				if((y == 0||y == (termHeight-1))) { // Top or Bottom border
						CurrLine+=`=`;
				}
				else if( y == (termHeight - stateLines -2) && x > lColumnChars) {
					CurrLine+=`=`;
				}
				 else {
					if(x == 0 || x == (termWidth-1) || x == lColumnChars) { // Left and Right border || Buffer splitter
						CurrLine+=`|`;
					}
					
					else {
						if(x > 0 && x < lColumnChars) {
						if(y in lColListLines) {					
							if(status2[termHeight-y-2] !== undefined && status2[termHeight-y-2] !== null
								&& status2[termHeight-y-2][0] !== undefined && status2[termHeight-y-2][0] != null
								&& status2[termHeight-y-2][1] !== undefined && status2[termHeight-y-2][1] != null)
							{
								if(x >= 1 && x < 11) { // left padding
									CurrLine += status2[termHeight-y-2][0][x-1];
								}else if(status2[termHeight-y-2][1][x-11] !== undefined) {
									CurrLine += status2[termHeight-y-2][1].toString().substring(0,lColumnChars-2)[x-11];
								} else {
									CurrLine += ` `;
								}
							}
						  else {
							 CurrLine += ` `;
						  }
						}
						} else {						
						if(y in listLines) {					
							if(bufferList[y-1] !== undefined)
							{
								if(x-lColumnChars >= 2 && x-lColumnChars < 10) { // left padding
									CurrLine += bufferList[y-1][0][x-2-lColumnChars];
								}else 
								if(bufferList[y-1][1][x-11-lColumnChars] !== undefined) {
									CurrLine += bufferList[y-1][1][x-11-lColumnChars];
								} else {
									CurrLine += ` `;
								}
							} else {
								CurrLine += ` `;
							}
						 } else
						if( y in stateListLines) {
							if(status1[termHeight-2-y] !== undefined) {

							if(x-lColumnChars >= 2 && x-lColumnChars < 10 && status1[termHeight-2-y][0][x-2-lColumnChars] !== undefined) {								
									CurrLine += status1[termHeight-2-y][0][x-2-lColumnChars];
							} else if(x-lColumnChars >=10 && status1[termHeight-2-y] != undefined && status1[termHeight-2-y][0] !== undefined && status1[termHeight-2-y][1][x-11-lColumnChars] != undefined) {
									CurrLine += status1[termHeight-2-y][1][x-11-lColumnChars];

							} else {
								CurrLine += ` `;
							}
						} else {
								CurrLine += ` `;

						}
					}
				}
							}
	}
 }
 ns.print(CurrLine);
		}
 }
			/*for(let x =0; x < termWidth;x++) {
				if(y == 0||y == (termHeight-1) || y == (termHeight-2-stateLines)) { // Top or Bottom border
					CurrLine+=`=`;
				}				
				 else {
					if(x == 0 || x == (termWidth-1) || x == lColumnChars) { // Left and Right border
						CurrLine+=`|`;
					}else if (x == 1) {
						CurrLine +=` `;
					} else if (x == 10) {
						CurrLine += ` `;
					}
					
					else {
						if(y in listLines) {					
							if(bufferList[y-1] !== undefined)
							{
								if(x >= 2 && x < 10) { // left padding
									CurrLine += bufferList[y-1][0][x-2];
								}else 
								if(bufferList[y-1][1][x-11] !== undefined) {
									CurrLine += bufferList[y-1][1][x-11];
								} else {
									CurrLine += ` `;
								}
							}
						 } else
						if( y in stateListLines) {
							if(status1[termHeight-2-y] !== undefined) {

							if(x >= 2 && x < 10 && status1[termHeight-2-y][0][x-2] !== undefined) {								
									CurrLine += status1[termHeight-2-y][0][x-2];
							} else if(x >=10 && status1[termHeight-2-y] != undefined && status1[termHeight-2-y][0] !== undefined && status1[termHeight-2-y][1][x-11] != undefined) {
									CurrLine += status1[termHeight-2-y][1][x-11];

							} else {
								CurrLine += ` `;
							}
						} else {
								CurrLine += ` `;
						}
					}
				}				
			
			}
			}*/

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep');
	
	ns.tail();
while(true) {
	draw(ns);
	await ns.sleep(1000);
}
}