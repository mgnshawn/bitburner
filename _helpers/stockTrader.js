// Credit Goes to PriNT2357
import { money } from '/_helpers/helpers.js';
import { getItem, setItem, clearItem } from '/_helpers/ioHelpers.js';
var profitOverTime;
/** @param {NS} ns **/
export async function main(ns) {
	const purchaseForecase = 0.55; // Purchase if the forecast is over this value
	const sellForecase = 0.4; // Sell if forecase is below this value
	const moneyBuffer = 1000000; // Do not buy if money would go below this value
	const sellForProfitOf = 1.10; //Percent profit desired
	const minutesBetweenStatusUpdates = 1;
	const secondsBetweenMarketChecks = 1;

	ns.disableLog("sleep");
	ns.disableLog("stock.sell");
	ns.disableLog("stock.buy");
	ns.clearLog();
	var symbols = ns.stock.getSymbols();
	var netProfit = 0;
	var verbose = false;
	for (let x in ns.args) {
		if (ns.args[x] == "v") {
			verbose = true;
		}
		if (['showposition', 'showpositions'].includes(ns.args[x])) {
			setItem(ns, 'stockCommandAction', 'showpositions');
			await ns.sleep(100);
			ns.exit();
		}
	}
	ns.tail();
	let startingProfit = localStorage.getItem('stockProfitOverTime');
	profitOverTime = { 'time': Date.now() / 1000, 'profit': +startingProfit ?? 0 };
	let now = new Date();
	var positions = [];
	var printProfit = false;
	positions = updatePositions(ns, symbols);
	let time = now.getHours() + ":" + now.getMinutes();
	ns.print(`${time} Profit over time: ${money(profitOverTime.profit)}`);
	drawPositions(ns, positions);
	let marketCheckedAt = Date.now() / 1000;
	while (true) {

		if (((Date.now() / 1000) - profitOverTime.time) >= (minutesBetweenStatusUpdates * 60)) {
			profitOverTime.time = Date.now() / 1000;
			let now = new Date();
			let time = now.getHours() + ":" + now.getMinutes();
			ns.print(`${time} Profit over time: ${money(profitOverTime.profit)}`);
			drawPositions(ns, positions);
		}

		if ((Date.now() / 1000) - marketCheckedAt >= secondsBetweenMarketChecks) {


			// Check if any sales need to be made
			for (var i = 0; i < positions.length; i++) {

				var p = positions[i];

				if (p.owned) {
					let shares = ns.stock.getPosition(p.symbol)[0];
					let preSalePrice = ns.stock.getPrice(p.symbol);
					let preSalePurchasedPrice = p.avgPriceLong;
					if ((ns.stock.getPrice(p.symbol)) > (p.avgPriceLong * sellForProfitOf)) {
						//						if(verbose)ns.print(`preSale: ${((ns.stock.getPrice(p.symbol) - p.avgPriceLong) * shares)}  > ${((p.avgPriceLong * sellForProfitOf)*shares*sellForProfitOf)}`);
						//ns.print(`..:: PreSale Profit Percent  ${Math.round(((ns.stock.getPrice(p.symbol) / p.avgPriceLong))*100)/100}%`);
						let soldAt = ns.stock.sell(p.symbol, p.sharesLong);
						ns.print(`\t\t..::$$$$ Sold ${p.symbol} x ${shares} @ ${money(Math.round(soldAt * 100) / 100)}\tBought@ ${money(Math.round(preSalePurchasedPrice * 100) / 100)} = ` + money(((soldAt - preSalePurchasedPrice) * shares) - 100000) + `  Profit => ${Math.round(((soldAt / preSalePurchasedPrice)) * 100) / 100}%`);
						ns.print(`soldAt ${soldAt} preSalePurchase ${preSalePurchasedPrice} shares ${shares}   total sale = ${money((soldAt * shares) - 100000)}`);
						netProfit += Math.round((soldAt - preSalePurchasedPrice) * shares);
						updateProfit(Math.round((soldAt - preSalePurchasedPrice) * shares));
						printProfit = true;
						let tmpPositions = updatePositions(ns, symbols);
						let totalPositions = 0;
						tmpPositions.forEach(p => {
							if (p.owned > 0) {
								totalPositions += Math.round(p.avgPriceLong * p.shares);
							}
						});
						ns.print(`\t\tTotal Invested:: $${money(totalPositions)}`);
					} else {
						if (p.forecast < sellForecase && ns.stock.getPrice(p.symbol) > p.avgPriceLong) {
							// ns.print(ns.sprintf("Selling %s shares of %s due to poor forecast (%0.2f) ($%5s)", (p.sharesLong), p.symbol, p.forecast, formatNumber(p.profit)));
							let soldAt = ns.stock.sell(p.symbol, p.sharesLong);
							ns.print(`\t\t..::<<>> Sold ${p.symbol} x ${shares} @ ${money(Math.round(soldAt * 100) / 100)}\tBought@ ${money(Math.round(preSalePurchasedPrice * 100) / 100)} = ` + money(((soldAt - preSalePurchasedPrice) * shares) - 100000) + `  Profit => ${Math.round(((soldAt / preSalePurchasedPrice)) * 100) / 100}%`);
							ns.print(`soldAt ${soldAt} preSalePurchase ${preSalePurchasedPrice} shares ${shares}   total sale = ${money((soldAt * shares) - 100000)}`);
							netProfit += Math.round((soldAt - preSalePurchasedPrice) * shares);
							updateProfit(Math.round((soldAt - preSalePurchasedPrice) * shares));
							printProfit = true;
							let tmpPositions = updatePositions(ns, symbols);
							let totalPositions = 0;
							tmpPositions.forEach(p => {
								if (p.owned > 0) {
									totalPositions += Math.round(p.avgPriceLong * p.shares);
								}
							});
							ns.print(`\t\tTotal Invested:: $${money(totalPositions)}`);
						} else {
							if (verbose) ns.print(`Didnt Sell: ${p.symbol} of ${shares} current ${money(Math.round(ns.stock.getPrice(p.symbol) * 100) / 100)} bought@ ${money(Math.round(p.avgPriceLong * 100) / 100)}:: ${(ns.stock.getPrice(p.symbol))} ?<>? ${((p.avgPriceLong * sellForProfitOf))} => ${money(ns.stock.getPrice(p.symbol) - (p.avgPriceLong * sellForProfitOf))} would yield ${Math.round(((ns.stock.getPrice(p.symbol) / p.avgPriceLong)) * 100) / 100}%`);
						}
					}
				}
				else {
					if (p.forecast > purchaseForecase) {
						let preBuyPrice = ns.stock.getPrice(p.symbol);
						// ns.print(ns.sprintf("Purchasing %5s at %5s/share", p.symbol, formatNumber(p.ask)));
						var cost = ns.stock.getPurchaseCost(p.symbol, p.shares, "Long");
						if (cost < ns.getPlayer().money - 100000 - moneyBuffer) {
							let boughtAt = ns.stock.buy(p.symbol, p.maxShares);
							ns.print(`\t\t..::     Bought ${p.symbol} x ${p.maxShares} @ ${money(Math.round(boughtAt * 100) / 100)} x ${p.shares} for ${money(boughtAt + 100000)}`);
							//netProfit -= cost;
							//updateProfit(cost * -1);
							printProfit = true;
							let tmpPositions = updatePositions(ns, symbols);
							let totalPositions = 0;
							tmpPositions.forEach(p => {
								if (p.owned > 0) {
									totalPositions += Math.round(p.avgPriceLong * p.shares);
								}
							});
							ns.print(`\t\tTotal Invested:: $${money(totalPositions)}`);
						}
					} else {
						//ns.print(`\t\t ${p.symbol} forecast ${p.forecast} !> ${purchaseForecase}`);
					}
				}
			}
			//		if (printProfit) {
			//			ns.print(ns.sprintf("Running Profit: $%8s", ns.nFormat(netProfit, "0a")));
			//		}

			marketCheckedAt = Date.now() / 1000;
		}
		let stockCommandAction = getItem(ns, 'stockCommandAction');
		if (stockCommandAction !== undefined && stockCommandAction == 'showpositions') {
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

function updatePositions(ns, symbols) {
	let positions = [];
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
			"shares": 0
		};
		if (ns.stock.getPosition(s)[1] > 0) {
			data.shares = ns.stock.getPosition(s)[0];
			// average purchase price is not zero (is an owned stock)
			data.owned = true;
		}
		positions.push(data);
	}
	return positions;
}

function drawPositions(ns, positions) {
	positions.filter(p => p.owned > 0).forEach(pos => {
		let currPrice = ns.stock.getPrice(pos.symbol);
		let ratio;
		if ((currPrice - pos.avgPriceLong < 0)) {
			ratio = ((currPrice - pos.avgPriceLong < 0) ? "-" : " ") + (Math.round(10000 * (1 - (currPrice / pos.avgPriceLong))) / 100);
		} else {
			ratio = ((currPrice - pos.avgPriceLong < 0) ? "-" : " ") + (Math.round(10000 * ((currPrice / pos.avgPriceLong) - 1)) / 100);
		}
		ns.print(`\t\t\t${pos.symbol}\t${money(pos.shares)} shares @ $${money(pos.avgPriceLong)} current Price $${money(currPrice)} standing ${ratio}%`);
	})
}