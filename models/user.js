// imports
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
	email: String,
	phone: String,
	name: String,
	password: String,
	status: Number,
	role: String,
});

const User = mongoose.model('user', userSchema);
module.exports = User;
