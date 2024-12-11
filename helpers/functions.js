const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function fetchMetadata(url) {
	try {
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let title = $('adbl-title-lockup h1').text().trim();
		let subtitle = $('adbl-title-lockup h2').text().trim() || '';
		let data = $('adbl-product-metadata').text().trim();
		let description = $('adbl-text-block').html().trim();
		let image = $('adbl-product-image img').attr('src');
		let tagsElementsNodes = $('adbl-chip-group adbl-chip');
		let tagsElements = [];
		const newData = new Date().toISOString();
		const coverImage =
			title
				.toLowerCase()
				.replace(/\s/g, '-')
				.replace(/\?|\!|\\|\/|=|\$/g, '') +
			'-' +
			newData +
			'.jpg';
		const destImage = path.join(
			__dirname,
			'../',
			'uploads',
			'cover-images',
			coverImage
		);
		const savePath = path.join('/uploads', 'cover-images', coverImage);
		const noDestImage = path.join(
			'/uploads',
			'cover-images',
			'no-image.jpg'
		);
		const isSuccess = await downloadFile(image, destImage);
		if (isSuccess) {
			image = savePath;
		} else {
			image = noDestImage;
		}

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
			image,
		};
		// Log the tokens after the split
		console.log('audiobookMetadata', audiobookMetadata);
		return { ...audiobookMetadata, description };
	} catch (err) {
		console.log('0000000000', { err });
		return null;
	}
}

const downloadFile = (url, dest) => {
	return new Promise(async (resolve, reject) => {
		try {
			let file = fs.createWriteStream(dest);
			const response = await axios({
				url,
				method: 'GET',
				responseType: 'stream',
			});
			response.data
				.pipe(fs.createWriteStream(dest))
				.on('error', reject)
				.once('close', () => resolve(true));
		} catch (err) {
			console.log('download', err);
			reject(false);
		}
	});
};

module.exports = {
	fetchMetadata,
};
