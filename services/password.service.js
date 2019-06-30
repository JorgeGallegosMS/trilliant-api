'use strict';
const bcrypt = require('bcrypt');
const genSalt = require('bluebird').promisify(bcrypt.genSalt, {context: bcrypt});

const CustomError = require('../libs/custom-error.lib');

module.exports = {
	createHash: async(plainTextPass) => {
		try {
			const salt = await genSalt(10);
			const hash = await bcrypt.hash(plainTextPass, salt);
			return hash;
		} catch(err) {
			throw new CustomError({
				message: 'error creating the hash',
				code: 401
			});
		}
	},

	verifyPassword: async function(password) {

		try {
			if (password === '') {
				throw new CustomError({
					message: 'invalid psw',
					code: 401,
					customCode: "301",
					success: false
				});
			}
			const isValid = await bcrypt.compare(password, this.password);
			if(!isValid) {
				throw new CustomError({
					message: 'invalid credentials',
					code: 401,
					customCode: "301",
					success: false
				});
			}
			return isValid;
		} catch(err) {
			throw new CustomError({
				message: 'validation error',
				code: 401,
				customCode: "303"
			});
		}
	}
};