// imports
const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/auth');

// Single routing
const router = express.Router();

// Register Route with Password Hashing
router.post(
	'/register',
	[
		body('email').isEmail().withMessage('Please enter a valid email.'),
		body('phone')
			.isMobilePhone()
			.withMessage('Please enter a valid phone number.'),
		body('name')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter your name.'),
		body('password')
			.trim()
			.isLength({ min: 8 })
			.withMessage('Please use at least 8 characters for your password.'),
	],
	register
);

// Login Route with Password Verification
router.post(
	'/login',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter the email you used to register.'),
		body('password')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Password can not be empty.'),
	],
	login
);

// Placeholder Routes
router.post('/forget-password', function (req, res, next) {
	console.log('Router Working');
	res.end();
});

router.post('/change-password', function (req, res, next) {
	console.log('Router Working');
	res.end();
});

module.exports = router;
