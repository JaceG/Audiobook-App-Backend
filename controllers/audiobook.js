const axios = require('axios');
const cheerio = require('cheerio');

async function getAudiobookInfo(req, res) {
	try {
		const { url } = req.body;
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let data = $('adbl-product-metadata').text().trim();
		let description = $('adbl-text-block').html().trim();

		// Log the raw data for debugging
		console.log('Raw data:', data);

		// Use regex to split at exactly three newline sequences (with optional spaces)
		const dataTokens = data.split(/\n\s*?\n\s*\n\s/);
		const audioData = dataTokens.map((token) => JSON.parse(token));

		const audiobookMetadata = { ...audioData[0], ...audioData[1] };
		// Log the tokens after the split
		console.log('Split tokens:', dataTokens);

		return res
			.status(200)
			.json({ data: { ...audiobookMetadata, description } });
	} catch (error) {
		let status = 500;

		if (error.response && error.response.status) {
			status = error.response.status;
		}

		// Log the error details
		console.error('Error fetching audiobook data:', error.message);
		res.status(status).json({
			message: 'Failed to fetch audiobook data!',
			error,
		});
	}
}

module.exports = {
	getAudiobookInfo,
};
