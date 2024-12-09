const axios = require('axios');
const cheerio = require('cheerio');
async function fetchMetadata(url) {
	try {
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let title = $('adbl-title-lockup h1').text().trim();
		let subtitle = $('adbl-title-lockup h2').text().trim() || '';
		let data = $('adbl-product-metadata').text().trim();
		let description = $('adbl-text-block').html().trim();
		let tagsElementsNodes = $('adbl-chip-group adbl-chip');
		let tagsElements = [];
		for (tagsElementsNode of tagsElementsNodes) {
			tagsElements.push($(tagsElementsNode).text());
		}

		// Use regex to split at exactly three newline sequences (with optional spaces)
		const dataTokens = data.split(/\n\s*?\n\s*\n\s/);
		const audioData = dataTokens.map((token) => JSON.parse(token));

		const audiobookMetadata = {
			...audioData[0],
			...audioData[1],
			title,
			subtitle,
			tags: tagsElements,
		};
		// Log the tokens after the split
		console.log('audiobookMetadata', audiobookMetadata);
		return { ...audiobookMetadata, description };
	} catch (err) {
		return null;
	}
}
module.exports = {
	fetchMetadata,
};
