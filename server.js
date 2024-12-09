// imports
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const audiobooks = require('./routes/audiobooks');
const isAuth = require('./middleware/isAuth');

// intilization
const app = express();

app.use(cors());

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		console.log(file);
		cb(null, 'uploads');
	},
	filename: (req, file, cb) => {
		console.log(file);
		cb(null, parseInt(Math.random() * 1000, 10) + '-' + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	console.log(file.mimetype);
	if (
		file.mimetype === 'audio/mp4' ||
		file.mimetype === 'audio/mpeg' ||
		file.mimetype === 'audio/x-m4a' ||
		file.mimetype === 'application/octet-stream'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', auth);
app.use(
	'/audiobooks',
	isAuth,
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('file'),
	audiobooks
);

//routes
app.get('/', function (req, res) {
	res.send('<h1> Helloss33333 !! </h1>');
});

app.listen(8000, () => {
	console.log('server started 8000');
});

mongoose
	.connect('mongodb://127.0.0.1:27017/audiobooks')
	.then(() => console.log('Connected!'));
