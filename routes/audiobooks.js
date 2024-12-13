// imports
const express = require('express');
const audiobookMetadata = require('music-metadata');
const Audiobook = require('../models/audiobooks');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const { getAudiobookInfo } = require('../controllers/audiobook');
const { fetchMetadata } = require('../helpers/functions');
// Single routing
const router = express.Router();

router.post(
	'/add',
	[
		body('title')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter a title.'),
		body('author')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter a author name.'),
		body('narrator')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter narrator name.'),
		body('description')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter a description.'),
		body('year')
			.trim()
			.not()
			.isEmpty()
			.custom((value, { req }) => {
				console.log(!/^[0-9]{4,4}$/.test(value));
				if (!/^[0-9]{4,4}$/.test(value)) {
					throw new Error(
						'Please enter the valid year when the book was published.'
					);
				}
				return true;
			}, body('file').trim().not().isEmpty().withMessage('Plpease upload a file.')),
	],
	async function (req, res, next) {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				const error = new Error('Validation failed.');
				error.statusCode = 422;
				error.data = errors.array();
				throw error;
			}

			const { title, author, narrator, description, year } = req.body;
			await Audiobook.create({
				title,
				author,
				narrator,
				description,
				year,
				file: req.file.path,
				userId: req.userId,
			});
			res.json({
				message: 'Audiobook uploaded succesfully!',
			});
		} catch (error) {
			let status = 500;

			if (error.statusCode) {
				status = error.statusCode;
			}
			res.status(status).json({
				message: 'Failed to upload audiobook',
				error,
			});
		}
	}
);

router.delete('/delete/:id', async function (req, res, next) {
	try {
		const audiobook = await Audiobook.findById(req.params.id);
		if (!audiobook) {
			const error = new Error('Audiobook not found');
			error.statusCode = 404;
			throw error;
		}
		await Audiobook.findByIdAndDelete(req.params.id);
		res.json({
			message: 'Audiobook deleted successfully!',
		});
	} catch (error) {
		console.log('Error', error);
		let status = 500;

		if (error.statusCode) {
			status = error.statusCode;
		}
		res.status(status).json({
			message: 'Failed to delete audiobook',
			error,
		});
	}
});

router.get('/list', async function (req, res, next) {
	const currentPage = req.query.page || 1;
	const perPage = 2;
	const audiobooks = await Audiobook.find({ userId: req.userId })
		.skip((currentPage - 1) * perPage)
		.limit(perPage)
		.sort({ title: 1 });
	const count = await Audiobook.find().countDocuments();
	res.json({
		message: 'Audiobook added successfully!',
		data: audiobooks,
		count,
	});
});

router.post('/search-user', async function (req, res, next) {
	const name = req.body.name;
	const perPage = 2;
	const users = await User.find({
		name: { $regex: name, $options: 'i' },
		role: 'admin',
	});
	res.json({
		message: 'Users searched successfully!',
		data: users,
	});
});

router.post('/add-friend', async function (req, res, next) {
	const id = req.body.id;
	const user = await User.findById(req.userId);
	user.friends.push(id);
	await user.save();
	res.json({
		message: 'Friend added!',
	});
});

router.get('/get-friends', async function (req, res, next) {
	const user = await User.findById(req.userId).populate('friends');
	res.json({
		message: 'Friends found!',
		data: user.friends,
	});
});

router.post('/get-details', getAudiobookInfo);

router.post(
	'/sync-audiobook',
	// [
	// 	body('url').trim().isURL().isEmpty().withMessage('Please enter a url.'),
	// 	body('file')
	// 		.trim()
	// 		.not()
	// 		.isEmpty()
	// 		.withMessage('Please upload a file.'),
	// ],
	async function (req, res, next) {
		try {
			// const errors = validationResult(req);

			// if (!errors.isEmpty()) {
			// 	const error = new Error('Validation failed.');
			// 	error.statusCode = 422;
			// 	error.data = errors.array();
			// 	throw error;
			// }

			const { url } = req.body;
			const metaData = await fetchMetadata(url);

			await Audiobook.create({
				title: metaData.title,
				subtitle: metaData.subtitle,
				release: metaData.releaseDate,
				authors: metaData.authors,
				narrators: metaData.narrators,
				series: metaData.series,
				description: metaData.description,
				format: metaData.format,
				duration: metaData.duration,
				publisher: metaData.publisher,
				year: metaData.year,
				duration: metaData.duration,
				rating: metaData.rating.value,
				categories: metaData.categories,
				tags: metaData.tags,
				file: req.file.path,
				coverImage: metaData.image,
				userId: req.userId,
			});
			res.json({
				message: 'Audiobook synced succesfully!',
			});
		} catch (error) {
			let status = 500;

			if (error.statusCode) {
				status = error.statusCode;
			}
			console.log('ERR', error);
			res.status(status).json({
				message: 'Failed to upload audiobook',
				error,
			});
		}
	}
);

module.exports = router;
