const Language = require('@google-cloud/language');

function entities(text) {
	const language = Language();
	const document = language.document({
		content: text
	});
	return document.detectEntities()
		.then((results) => {
			return results[1].entities;
		});
}

function salienceCmp(e1, e2) {
	return e1.salience > e2.salience;
}

function sortedEntities(text) {
	return entities(text).then((s) => {
		return s.sort(salienceCmp);
	});
}

function sentiment(text) {
	const language = Language();
	const document = language.document({
		content: text
	});
	return document.detectSentiment()
		.then((results) => {
			const sentiment = results[0];
			return sentiment;
		});
}

module.exports = {
	sentiment: sentiment,
	sortedEntities: sortedEntities,
	entities: entities
};
