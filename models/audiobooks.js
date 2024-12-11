// imports
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
	title: String,
	subtitle: String,
	release: String,
	authors: [
		{
			name: String,
			url: String,
		},
	],
	narrators: [
		{
			name: String,
			url: String,
		},
	],
	series: [
		{
			name: String,
			url: String,
		},
	],
	description: String,
	format: String,
	duration: String,
	publisher: [
		{
			name: String,
			url: String,
		},
	],
	year: Number,
	duration: String,
	rating: Number,
	categories: [
		{
			name: String,
			url: String,
		},
	],
	tags: [String],
	file: String,
	coverImage: String,
	userId: Schema.Types.ObjectId,
});

const audiobook = mongoose.model('audiobooks', userSchema);
module.exports = audiobook;
