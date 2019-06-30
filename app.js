'use strict';

require('dotenv').config();

const path = require('path');
const port = process.env.PORT || 5000;

const db = require('./libs/db.lib');
const errorHandler = require('./services/error-handler.service');
const apiRouter = require('./routes/api.route');

const express = require('express');
const busboyBodyParser = require('busboy-body-parser');
const bodyParser = require('body-parser');


const cors = require('cors');
const app = express();

//app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
//app.enable("trust proxy");

db()
.then(() => {
	app.disable('x-powered-by');
	app.use(cors({
		exposedHeaders: ["Content-Range", "X-Total-Count"]
	}));
	app.use(busboyBodyParser());

	app.use(bodyParser.urlencoded({
		extended: false,
		limit: '50mb',
		parameterLimit: 100000
	}))

	app.use(bodyParser.json({
		limit: '50mb',
		parameterLimit: 100000
	}))

	app.use(bodyParser.raw({
		limit: '50mb',
		inflate: true,
		parameterLimit: 100000
	}))
	
	app.use(express.static(path.join(__dirname, './public')));
	app.use('/public/images', express.static(__dirname + '/public/images'));

	app.use('/api', apiRouter);

	app.use((req, res, next) => {
		const err = {};
		err.message = 'not found';
		err.success = false;
		err.code = 404;
		next(err);
	});

	app.use(errorHandler);

    app.listen(port, () => {
        console.log(`App is listening on port: ${port}`)
    })
})
.catch((err) => {
	throw new Error(`Err connecting to the db ${err}`);
});
