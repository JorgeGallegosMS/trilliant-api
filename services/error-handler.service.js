'use strict';
const sendJson = require('../services/message.service');

module.exports = (err, req, res, next) => {
	if(!err.showUser) {
		console.log(err);
	}

	switch(err.msg) {
		case 'not registered':
		case 'invalid password':
			res.status(401);
			sendJson({
				res, 
				msg: 'wrong username or password',  
				success: false, 
				code: 401, 
				customCode: "304"});
			break;

		case 'no password':
			res.status(400);
			sendJson({
				res, 
				msg: err.msg, 
				redirect: '/api/user/login', 
				success: false, 
				code: 400, 
				customCode: err.customCode});
			break;

		case 'no key':
			res.status(err.code);
			sendJson({
				res,
				msg: 'tried to enter GA code without a TOTP setup',
				redirect: '/api/totp/setup',
				code: err.code,
				success: false
			});
			break;

		case 'user exists':
			sendJson({
				res,
				msg: 'The user already exists',
				redirect: '/api/totp/setup',
				code: err.code,
				success: false
			});
			break;

		case 'rate limiter':
			sendJson({
				res,
				msg: 'Too many requests from this IP, please try again later',
				code: err.code,
				success: false
			});
			break;

		default:
			if(err.http_code) err.code = err.http_code
			sendJson({
				res, 
				msg: err.message, 
				success: false, 
				code: err.code || 500, 
				customCode: err.customCode});
			break;
	}
};