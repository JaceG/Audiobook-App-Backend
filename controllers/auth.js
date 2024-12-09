// imports
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

async function register(req, res) {
	try {
		// Simulated user input (replace with req.body data)
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}

		const { email, phone, name, password } = req.body;

		// Hash the password and create the user
		const hashedPassword = await bcrypt.hash(password, 12);

		await User.create({
			email,
			phone,
			name,
			password: hashedPassword,
			status: 1,
			role: 'user',
		});

		res.json({ message: 'User registered successfully!' });
	} catch (error) {
		let status = 500;

		if (error.statusCode) {
			status = error.statusCode;
		}
		console.error('Error registering user:', error);
		res.status(status).json({ message: 'Registration failed!', error });
	}
}

async function login(req, res) {
	try {
		// Simulated user input (replace with req.body data)
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}

		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({ email });

		if (!user) {
			return res
				.status(400)
				.json({ error: 'Invalid credentials, try again!' });
		}

		// Verify the provided password
		const isMatch = await bcrypt.compare(password, user.password);

		if (isMatch) {
			const token = jwt.sign(
				{
					email: user.email,
					userId: user._id.toString(),
				},
				'secret',
				{ expiresIn: '1h' }
			);
			res.json({ message: 'Login successfull', token });
		} else {
			res.status(400).json({ error: 'Invalid credentials, try again!' });
		}
	} catch (error) {
		let status = 500;

		if (error.statusCode) {
			status = error.statusCode;
		}
		console.error('Error registering user:', error);
		res.status(status).json({ message: 'Registration failed!', error });
	}
}

module.exports = {
	register,
	login,
};
