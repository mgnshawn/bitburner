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
	}
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
	 //draw(ns);
}
export function drawDoing(ns,newLine) {
	if(newLine === null) {
		return;
	}
		//let doing = getItem(ns,'doingLine');
		
		setItem(ns,'doingLine',newLine);
		
	 //draw(ns);
}
export function clearDoingLine(ns) {
	setItem(ns, 'doingLine', "");
}
export function clearLCol(ns) {
	setItem(ns, 'status2List', []);
}
export function clearStatusList(ns) {
	setItem(ns, 'statusList', []);
}
export function clearList1(ns) {
	setItem(ns, 'bufferList', []);
}
 function draw(ns) {
	 	let status1 = getItem(ns,'statusList');
		 let status2 = getItem(ns,'status2List');
		 let bufferList = getItem(ns,'bufferList');
		 let doingLine = getItem(ns,'doingLine');
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


		for(let y= 0;y<termHeight+2;y++) {	
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
			if(y >= termHeight) {
				if(y == termHeight+1) {
					for(let x =0; x < termWidth;x++) {
						CurrLine+=`=`;
					}	
				} else {
					let statusLine = ` [Money: $ ${Math.round(ns.getPlayer().money).toLocaleString('en-US')}   [Hack: ${ns.getPlayer().hacking}   [Karma: ${Math.round(ns.heart.break()).toLocaleString('en-US')}   [str: ${ns.getPlayer().strength}  [Dex: ${ns.getPlayer().dexterity}  [Agi: ${ns.getPlayer().agility} `;
					for(let x=0; x < termWidth;x++) {
					if(x == 0 || x == (termWidth-1)) { // Left and Right border || Buffer splitter
						CurrLine+=`|`;
					} else {
						if(x < 100) {
						if(statusLine[x-1] !== undefined) {							
							CurrLine+= statusLine[x-1];
							} else {
								CurrLine+=` `;
							}
						} else {
							if(x <= 107) {
								let he = ` Doing: `;
								CurrLine += he[x-100];
							} else {
							if(doingLine != null && doingLine.length > 0) {
								if(doingLine[x-108] !== undefined) {
									CurrLine+= doingLine[x-108];
								} else {
									CurrLine+=` `;
								}
							} else {
								CurrLine+= ` `;
							}
							}
						}
					
					}
					}
				}
			} else
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
/** @param {NS} ns **/
export async function main(ns) {
	if(ns.args[0] != undefined && ns.args[0] == "clear") {
		clearLCol(ns);
		clearStatusList(ns);
		clearList1(ns);
	}
	clearDoingLine(ns);
	ns.disableLog('sleep');
	
	ns.tail();
	let loop = 0;
while(true) {
	draw(ns);
	await ns.sleep(5);
	if(loop < 10) {
		clearDoingLine(ns);
		loop++;
	} else {
		loop = 0;
	}
	await ns.sleep(1000);
}
}