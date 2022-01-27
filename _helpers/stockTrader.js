// Credit Goes to PriNT2357
import { money } from '/_helpers/helpers.js';
import { getItem, setItem, clearItem } from '/_helpers/ioHelpers.js';
var profitOverTime;
var stockRangeHistory;
var runningPortfolioInvestment;
const stockCommish = 100000;
var currentlyRunning;
/** @param {NS} ns **/
export async function main(ns) {
	const purchaseForecase = 0.575; // Purchase if the forecast is over this value
	const purchasePercentUnderAverage = .6; // Purchase is the price is x percent of stock historic average
	const sellForecase = 0.5; // Sell if forecase is below this value
	const moneyBuffer = 1000000; // Do not buy if money would go below this value
	const sellForProfitOf = 1.05; //Percent profit desired
	const minutesBetweenStatusUpdates = 1;
	const secondsBetweenMarketChecks = 1;
	const maximumPortfolioInvestment = 10000000000;


	ns.disableLog("sleep");
	ns.disableLog("stock.sell");
	ns.disableLog("stock.buy");
	ns.clearLog();

	var symbols = ns.stock.getSymbols();
	var netProfit = 0;
	var verbose = false;
	var verboseType = '';
	var buyByAverage = false;
	var sellOnly = false;
	var sellOff = false;
	const validOptions = ['showposition', 'showpositions', 'verboseon', 'verboseoff', 'sellonly', 'v', 'selloff','verbosebuy','verbosesell'];
	for (let x in ns.args) {
		if (!validOptions.includes(ns.args[x])) {
			ns.tprint(`The only valid options are ${JSON.stringify(validOptions)}`);
			ns.exit();
		}
		if (ns.args[x] == "v") {
			verbose = true;
		}
		if (currentlyRunning && ['showposition', 'showpositions', 'verboseon', 'verboseoff', 'sellonly', 'selloff'].includes(ns.args[x])) {
			setItem(ns, 'stockCommandAction', ns.args[x]);
			await ns.sleep(100);
			ns.exit();
		}
		if (ns.args[x] == 'sellonly' || ns.args[x] == 'selloff') {
			sellOnly = true;
			if (ns.args[x] == 'selloff') {
				sellOff = true;
				setItem(ns, 'stockCommandAction', ns.args[x]);
				await ns.sleep(100);
			}
		} else {
			sellOnly = false;
		}
		if (ns.args[x] == 'v' || ns.args[x] == 'verboseon') {
			verbose = true;
		}
		if(ns.args[x] == 'verbosebuy') {
			verbose = true;
			verboseType = 'buy';
		}
		if(ns.args[x] == 'verbosesell') {
			verbose = true;
			verboseType = 'sell'
		}
	}
	clearItem(ns, 'stockCommandAction');
	await ns.sleep(100);
	currentlyRunning = true;
	ns.tail();
	let startingProfit = localStorage.getItem('stockProfitOverTime');
	await ns.sleep(10);
	profitOverTime = { 'time': Date.now() / 1000, 'profit': +startingProfit ?? 0 };
	let now = new Date();
	var positions = [];
	stockRangeHistory = localStorage.getItem('stockRangeHistory');
	await ns.sleep(10);
	if (stockRangeHistory == null || stockRangeHistory == undefined) {
		stockRangeHistory = {};
		localStorage.setItem('stockRangeHistory', JSON.stringify(stockRangeHistory));
		await ns.sleep(10);
	} else {
		stockRangeHistory = stockRangeHistory ? JSON.parse(stockRangeHistory) : undefined;
	}
	var printProfit = false;
	positions = await updatePositions(ns, symbols);
	let time = now.getHours() + ":" + now.getMinutes();
	ns.print(`\n${time} Profit over time: ${money(profitOverTime.profit)}`);
	await drawPositions(ns, positions);
	let marketCheckedAt = Date.now() / 1000;
	while (true) {
		positions = await updatePositions(ns, ns.stock.getSymbols());
		if (((Date.now() / 1000) - profitOverTime.time) >= (minutesBetweenStatusUpdates * 60)) {
			profitOverTime.time = Date.now() / 1000;
			let now = new Date();
			let time = now.getHours() + ":" + now.getMinutes();
			ns.print(`\n${time} Profit over time: ${money(profitOverTime.profit)}`);
			await drawPositions(ns, positions);
		}

		if ((Date.now() / 1000) - marketCheckedAt >= secondsBetweenMarketChecks) {


			// Check if any sales need to be made
			for (var i = 0; i < positions.length; i++) {

				var p = positions[i];

				if (p.owned) {
					let shares = ns.stock.getPosition(p.symbol)[0];
					let preSalePrice = ns.stock.getPrice(p.symbol);
					let preSalePurchasedPrice = p.avgPriceLong;
					if ((ns.stock.getPrice(p.symbol) > ((p.avgPriceLong * sellForProfitOf))) && (ns.stock.getPrice(p.symbol) * p.shares) > stockCommish) {
						//						if(verbose)ns.print(`preSale: ${((ns.stock.getPrice(p.symbol) - p.avgPriceLong) * shares)}  > ${((p.avgPriceLong * sellForProfitOf)*shares*sellForProfitOf)}`);
						//ns.print(`..:: PreSale Profit Percent  ${Math.round(((ns.stock.getPrice(p.symbol) / p.avgPriceLong))*100)/100}%`);
						let soldAt = ns.stock.sell(p.symbol, p.sharesLong);
						let tmpPositions = await updatePositions(ns, symbols);
						let totalPositions = 0;
						tmpPositions.forEach(p => {
							if (p.owned > 0) {
								totalPositions += Math.round(p.avgPriceLong * p.shares);
							}
						});
						ns.print(`..::$$$$ Sold ${p.symbol} x ${shares} @ ${money(Math.round(soldAt * 100) / 100)}\tBought@ ${money(Math.round(preSalePurchasedPrice * 100) / 100)} = ` + money(((soldAt - preSalePurchasedPrice) * shares) - stockCommish) + `  Profit => ${Math.round(((soldAt / preSalePurchasedPrice)) * 100) / 100}%\t\tTotal Invested:: $${money(totalPositions)}`);
						if (verbose && !verboseType == 'buy') ns.print(`soldAt ${soldAt} preSalePurchase ${preSalePurchasedPrice} shares ${shares}   total sale = ${money((soldAt * shares) - stockCommish)}`);
						netProfit += Math.round((soldAt - preSalePurchasedPrice) * shares);
						updateProfit(Math.round((soldAt - preSalePurchasedPrice) * shares));
						printProfit = true;

						ns.print(`\t`);
					} else {
						if ((ns.stock.getPrice(p.symbol) > (p.average * 1.25) && p.average > 0) /*||((ns.stock.getPrice(p.symbol) > (p.avgPriceShort + 100000)) && p.forecast < sellForecase)*/) {
							// ns.print(ns.sprintf("Selling %s shares of %s due to poor forecast (%0.2f) ($%5s)", (p.sharesLong), p.symbol, p.forecast, formatNumber(p.profit)));
							let soldAt = ns.stock.sell(p.symbol, p.sharesLong);
							let totalPositions = 0;
							let tmpPositions = await updatePositions(ns, symbols);
							tmpPositions.forEach(p => {
								if (p.owned > 0) {
									totalPositions += Math.round(p.avgPriceLong * p.shares);
								}
							});
							ns.print(`..::<<>> Sold ${p.symbol} x ${shares} @ ${money(Math.round(soldAt * 100) / 100)}\tBought@ ${money(Math.round(preSalePurchasedPrice * 100) / 100)} = ` + money(((soldAt - preSalePurchasedPrice) * shares) - stockCommish) + `  Profit => ${Math.round(((soldAt / preSalePurchasedPrice)) * 100) / 100}%`);
							if (verbose && !verboseType == 'buy') ns.print(`soldAt ${soldAt} preSalePurchase ${preSalePurchasedPrice} shares ${shares}   total sale = ${money((soldAt * shares) - stockCommish)}\t\tTotal Invested:: $${money(totalPositions)}`);
							netProfit += Math.round((soldAt - preSalePurchasedPrice) * shares);
							updateProfit(Math.round((soldAt - preSalePurchasedPrice) * shares));
							printProfit = true;


							ns.print(`\t`);
						} else {

							if (verbose && !verboseType == 'buy') ns.print(`Didnt Sell: ${p.symbol} of ${shares} current ${money(Math.round(ns.stock.getPrice(p.symbol) * 100) / 100)} bought@ ${money(Math.round(p.avgPriceLong * 100) / 100)}:: ${(ns.stock.getPrice(p.symbol))} ?<>? ${((p.avgPriceLong * sellForProfitOf))} => ${money(ns.stock.getPrice(p.symbol) - (p.avgPriceLong * sellForProfitOf))} would yield ${Math.round(((ns.stock.getPrice(p.symbol) / p.avgPriceLong)) * 100) / 100}%`);
						}
					}
				}
				else {
					if (!sellOnly && ns.getPlayer().money > (stockCommish + moneyBuffer + 200000) && runningPortfolioInvestment < maximumPortfolioInvestment) {
						if ((ns.stock.getPrice(p.symbol) < (p.average * purchasePercentUnderAverage))/* || (p.forecast > purchaseForecase)*/) {
							let preBuyPrice = ns.stock.getPrice(p.symbol);
							// ns.print(ns.sprintf("Purchasing %5s at %5s/share", p.symbol, formatNumber(p.ask)));
							var cost = ns.stock.getPurchaseCost(p.symbol, ns.stock.getMaxShares(p.symbol), "Long");
							var afford = Math.floor((ns.getPlayer().money - stockCommish - moneyBuffer) / preBuyPrice) * .99;
							let buyShares = 0;
							if (cost < ns.getPlayer().money - stockCommish - moneyBuffer) {
								buyShares = p.maxShares;
							} else if (ns.getPlayer().money - (afford * ns.stock.getPrice(p.symbol)) - stockCommish > moneyBuffer) {
								buyShares = afford;
								if (verbose && !verboseType == 'sell') ns.print(`afford ${afford} * ${ns.stock.getPrice(p.symbol)} > ${stockCommish}`);
							}
							if((buyShares*preBuyPrice)+runningPortfolioInvestment > maximumPortfolioInvestment) {
								buyShares = Math.floor((maximumPortfolioInvestment-runningPortfolioInvestment-stockCommish-moneyBuffer)/preBuyPrice);
								if (verbose && !verboseType == 'sell') ns.print(`Max Portfolio limit share purchase ${buyShares} * ${ns.stock.getPrice(p.symbol)}`);
							}
							if (buyShares > 0) {
								let boughtAt = ns.stock.buy(p.symbol, buyShares);
								let totalPositions = 0;
								let tmpPositions = await updatePositions(ns, symbols);
								tmpPositions.forEach(p => {
									if (p.owned > 0) {
										totalPositions += Math.round(p.avgPriceLong * p.shares);
									}
								});
								ns.print(`..::     Bought ${p.symbol} x ${buyShares} @ ${money(Math.round(boughtAt * 100) / 100)} for ${money((boughtAt*buyShares) + stockCommish)}\t\tTotal Invested:: $${money(totalPositions)}`);
								//netProfit -= cost;
								//updateProfit(cost * -1);
								printProfit = true;


								ns.print(`\t\t\tTotal Invested:: $${money(totalPositions)}`);
							} else {
								if (verbose && !verboseType == 'sell') ns.print(`didn't buy ${p.symbol} don't have $$ ${ns.getPlayer().money} < ${ns.stock.getPrice(p.symbol)} x ${afford} total: ${afford * ns.stock.getPrice(p.symbol)} `);
							}
						} else {
							if (verbose && !verboseType == 'sell') ns.print(`didn't buy ${p.symbol} @ (forecast ${p.forecast} !> ${purchaseForecase}) (bid ${ns.stock.getPrice(p.symbol)}) !< ${(p.average * purchasePercentUnderAverage)} L.${p.floor} H.${p.ceiling}`)
							//ns.print(`\t\t ${p.symbol} forecast ${p.forecast} !> ${purchaseForecase}`);
						}
					}
				}
			}
			//		if (printProfit) {
			//			ns.print(ns.sprintf("Running Profit: $%8s", ns.nFormat(netProfit, "0a")));
			//		}

			marketCheckedAt = Date.now() / 1000;
		}
		let stockCommandAction = getItem(ns, 'stockCommandAction');
		if (stockCommandAction !== undefined) {
			if (stockCommandAction == 'showpositions') {
				let totalPositions = 0;
				positions.forEach(p => {
					if (p.owned > 0) {
						totalPositions += Math.round(p.avgPriceLong * p.maxShares);
						ns.print(`\t\t${p.symbol}\t$${money(Math.round(p.maxShares * p.avgPriceLong))}`);
					}
				});
				ns.print(`\t\tTotal Invested:: $${money(totalPositions)}`);
				clearItem(ns, 'stockCommandAction');
				await ns.sleep(100);
			}
			if (stockCommandAction == 'verboseon') {
				verbose = true;
				clearItem(ns, 'stockCommandAction');
				await ns.sleep(100);
			}
			if (stockCommandAction == 'verboseoff') {
				verbose = false;
				clearItem(ns, 'stockCommandAction');
				await ns.sleep(100);
			}
			if (stockCommandAction == 'sellonly') {
				sellOnly = true;
				clearItem(ns, 'stockCommandAction');
				await ns.sleep(100);
			}
			if (stockCommandAction == 'selloff') {
				sellOnly = true;
				let totalSell = 0;
				let tmpPositions = await updatePositions(ns, symbols);
				tmpPositions.forEach(p => {
					if (p.owned > 0) {
						let soldAt = ns.stock.sell(p.symbol, p.sharesLong);
						totalSell += soldAt;
					}
				});
				tmpPositions = await updatePositions(ns, symbols);
				await ns.sleep(4000);
				ns.print(`Total liquidated: $${money(totalSell)}`);
				clearItem(ns, 'stockCommandAction');
				await ns.sleep(100);
				ns.exit();
			}
		}
		await ns.sleep(1000);
	}
}
function updateProfit(money) {
	profitOverTime.profit += money;
	localStorage.setItem('stockProfitOverTime', profitOverTime.profit);
}

function formatNumber(n) {
	const div = 1000;
	var m = n * div; // account for first run of do{}
	var labels = ["", "k", "m", "b", "t"];
	var label = "";
	do {
		m = Number(m / div).toFixed(1); //convert to closest label
		label = labels.shift();
	} while (m >= div && labels.length !== 0)

	return m + label;
}

async function updatePositions(ns, symbols, updateTrending = false) {
	let positions = [];
	runningPortfolioInvestment = 0;
	for (var i = 0; i < symbols.length; i++) {
		var s = symbols[i];
		var data = {
			"symbol": s,
			"owned": false,
			"maxShares": ns.stock.getMaxShares(s),
			"profit": ns.stock.getSaleGain(s, ns.stock.getPosition(s)[0], "Long"),
			"ask": ns.stock.getAskPrice(s),
			"bid": ns.stock.getBidPrice(s),
			"sharesLong": ns.stock.getPosition(s)[0],
			"avgPriceLong": ns.stock.getPosition(s)[1],
			"sharesShort": ns.stock.getPosition(s)[3],
			"avgPriceShort": ns.stock.getPosition(s)[4],
			"forecast": ns.stock.getForecast(s),
			"shares": 0,
			"floor": 100000000,
			"ceiling": 0,
			"average": 0,
			"previousRatio": 0,
			"changeInRatio": 0,
			"ratio": 0
		};		
		let usingPrice = ns.stock.getPrice(data.symbol);
		if (stockRangeHistory !== null && stockRangeHistory[data.symbol] !== undefined) {
			if (usingPrice > stockRangeHistory[data.symbol].ceiling) {
				data.ceiling = usingPrice;
			} else {
				data.ceiling = stockRangeHistory[data.symbol].ceiling;
			}
			if (usingPrice < stockRangeHistory[data.symbol].floor) {
				data.floor = usingPrice;
			} else {
				data.floor = stockRangeHistory[data.symbol].floor;
			}
		}
		if (ns.stock.getPosition(s)[0] > 0) {			
			data.shares = ns.stock.getPosition(s)[0];
			runningPortfolioInvestment += (data.avgPriceLong*data.shares);
			// average purchase price is not zero (is an owned stock)
			data.owned = true;
		}
		data.lastSceneAt = ns.stock.getPrice(data.symbol);
let ratio = data.ratio = ((usingPrice / data.avgPriceLong) - 1);
		if (data.owned && stockRangeHistory[data.symbol] !== undefined && stockRangeHistory[data.symbol] != null) {
			
			if (stockRangeHistory[data.symbol].previousRatio !== null && stockRangeHistory[data.symbol].previousRatio !== undefined) {
				stockRangeHistory[data.symbol].changeInRatio = data.changeInRatio = (ratio - stockRangeHistory[data.symbol].previousRatio);
			}
			if (data.previousRatio !== ratio && updateTrending) {
				stockRangeHistory[data.symbol].previousRatio = data.previousRatio = ratio;
			}
		} else if(stockRangeHistory[data.symbol] !== undefined && stockRangeHistory[data.symbol] != null) {

			data.average = ((data.ceiling + data.floor) / 2);

			stockRangeHistory[data.symbol].floor = data.floor = (stockRangeHistory[data.symbol].floor < data.floor) ? stockRangeHistory[data.symbol].floor : data.floor;
			stockRangeHistory[data.symbol].ceiling = data.ceiling = (stockRangeHistory[data.symbol].ceiling > data.ceiling) ? stockRangeHistory[data.symbol].ceiling : data.ceiling;
			stockRangeHistory[data.symbol].average = data.average = ((data.ceiling + data.floor) / 2);
			stockRangeHistory[data.symbol].forecast = data.forecast;
			stockRangeHistory[data.symbol].ratio = ratio;
			stockRangeHistory[data.symbol].shares = data.shares;
			stockRangeHistory[data.symbol].lastSceneAt = data.lastSceneAt;
		} else {
			stockRangeHistory[data.symbol] = data;
		}
		stockRangeHistory[data.symbol].lastCompare = `${data.symbol}  ${data.floor} << ${ns.stock.getPrice(data.symbol)} << ${data.ceiling}`;
		positions.push(data);
	}

	let now = new Date();
	let time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	stockRangeHistory.lastUpdate = time;
	localStorage.setItem('stockRangeHistory', JSON.stringify(stockRangeHistory));
	await ns.sleep(10);
	return positions;
}

async function drawPositions(ns, positions) {
	positions.filter(p => p.owned > 0).forEach(pos => {
		let currPrice = ns.stock.getPrice(pos.symbol);
		let ratio = (Math.round(pos.ratio * 100) / 100);
		let trending = (Math.round(pos.changeInRatio * 100) / 100);

		ns.print(`\t\t\t${pos.symbol}\t${money(pos.shares)} shares @ $${money(pos.avgPriceLong)} current Price $${money(currPrice)} standing ${ratio}%  trending: ${trending}%  selling w/=> ${money(((pos.avgPriceLong - currPrice) * pos.shares * -1) - stockCommish)}`);
	});
	ns.print(`\t\t\tCurrent Portfolio value: $${money(runningPortfolioInvestment)}`);
	await updatePositions(ns, ns.stock.getSymbols(), true);
}