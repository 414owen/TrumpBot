const fs = require('fs');
const path = require('path');
const Bot = require("slackbots");
const Util = require("./util");
const Quotes = require("./quotes.js");
const Text = require('markov-chains-text').default;

console.log("Reading slackbot token");
const BOT_TOKEN = fs.readFileSync(path.join(__dirname, "token")).toString().trim();

console.log("Reading Trump's reference material");
const trumpText = [
	"speeches", "remarks", "interviews"
].map((type) => {
	const typedir = path.join(__dirname, type);
	const fileNames = fs.readdirSync(typedir);
	return fileNames.map((fileName) => {
		const filePath = path.join(typedir, fileName);
		console.log(filePath);
		const text = fs.readFileSync(filePath).toString();
		return text;
	});
}).join("\n");

console.log("Generating Markov Chain");
const chain = new Text(trumpText);
function nextSentence() {
	return chain.makeSentence();
}

const dict = {
	lname: "trumpbot",
	name: "Trumpbot",
	botMessage: "bot_message"
};

const settings = {
	token: BOT_TOKEN,
	name: dict.name
};

const bot = new Bot(settings);

bot.getUserId(dict.lname).then((data) => {
	console.log("Got user id:", data);
	dict.userId = data;
}, function(err) {
	console.error("Couldn't retrieve user id :(", err);
	process.exit(1);
});

function closestQuote(quote) {
	return Util.sortedEntities(quote).then((entities) => {
		const date = new Date();
		if (entities.length === 0) {return null;}
		const rel = Quotes.reduce((acc, quo) => {
			var ents1 = quo.entities;
			var match = 0;
			if (quo.time && Math.abs(date - quo.time) < 300000) {return acc;}
			entities.forEach((e1) => {
				ents1.forEach((e2) => {
					match += (e1.name.toLowerCase() === e2.name.toLowerCase()) * e1.salience;
				});
			});
			match /= ents1.length;
			return match >= acc[0] ? [match, quo] : acc;
		}, [0, null]);
		console.log("Relevance:", rel[0]);
		if (rel[1]) {rel[1].time = date;}
		if (rel[0] >= 0.4) {
			return rel[1];
		}
	});
}

bot.on("message", (data) => {
	if (data.type !== "message" ||
		data.user === undefined || 
		data.text == null       ||
		data.user === dict.userId) {return;}

	let quote;
	// console.log(data);
	closestQuote(data.text).then((q) => {
		quote = q ? q.quote : nextSentence();
		// console.log("Replying to user:", data.user, "with quote:", quote);
		console.log(q ? "Quote:" : "Generated Text:", quote);
		setTimeout(() => {bot.postMessage(data.channel, quote, {as_user: true});}, 2500);
	});
});
