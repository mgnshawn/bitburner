// Credit Goes to PriNT2357
import { money } from '/_helpers/helpers.js';
var profitOverTime;
/** @param {NS} ns **/
export async function main(ns) {
	const purchaseForecase = 0.6; // Purchase if the forecast is over this value
	const sellForecase = 0.5; // Sell if forecase is below this value
	const moneyBuffer = 1000000; // Do not buy if money would go below this value
	ns.tail();
	ns.disableLog("sleep");
	ns.clearLog();
	var symbols = ns.stock.getSymbols();
	var netProfit = 0;

	let startingProfit = localStorage.getItem('stockProfitOverTime');
	profitOverTime = { 'time': Date.now() / 1000, 'profit': +startingProfit ?? 0 };
	while (true) {
		var positions = [];
		var printProfit = false;
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
				"forecast": ns.stock.getForecast(s)
			};
			if (ns.stock.getPosition(s)[1] > 0) {
				// average purchase price is not zero (is an owned stock)
				data.owned = true;
			}
			positions.push(data);
		}

		if (((Date.now() / 1000) - profitOverTime.time) >= 60) {
			profitOverTime.time = Date.now() / 1000;
			let now = new Date();
			let time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
			ns.print(`${time} Profit over time: ${money(profitOverTime.profit)}`);
		}
		//ns.print(positions);
		// Check if any sales need to be made
		for (var i = 0; i < positions.length; i++) {

			var p = positions[i];
			if (p.owned) {
				if (p.forecast < sellForecase) {
					// ns.print(ns.sprintf("Selling %s shares of %s due to poor forecast (%0.2f) ($%5s)", (p.sharesLong), p.symbol, p.forecast, formatNumber(p.profit)));
					ns.stock.sell(p.symbol, p.sharesLong);
					netProfit += p.profit;
					updateProfit(p.profit);
					printProfit = true;
				}
			}
			else {
				if (p.forecast > purchaseForecase) {
					// ns.print(ns.sprintf("Purchasing %5s at %5s/share", p.symbol, formatNumber(p.ask)));
					var cost = ns.stock.getPurchaseCost(p.symbol, p.maxShares, "Long");
					if (cost < ns.getPlayer().money - 100000 - moneyBuffer) {
						ns.stock.buy(p.symbol, p.maxShares);
						netProfit -= cost;
						updateProfit(cost * -1);
						printProfit = true;
					}
				}
			}
		}
		if (printProfit) {
			ns.print(ns.sprintf("Running Profit: $%8s", ns.nFormat(netProfit, "0a")));
		}
		await ns.sleep(5000);
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