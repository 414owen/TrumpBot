const Quotes = require("./raw_quotes");
const Util = require("./util");

var num = 0;
var res = [];

quotes.forEach((quote) => {
	Util.sortedEntities(quote.quote).then((e) => {
		Util.sentiment(quote.quote).then((s) => {
			res.push({quote: quote.quote, entities: e, sentiment: s});
			console.error(num);
			if (num++ === quotes.length - 1) {
				console.log("module.exports = ", JSON.stringify(res), ";");
			}
		});
	});
});
