'use strict';

module.exports = ({data, msg, res, code, customCode, success = true}) => {
	const result = {};
	result.code = code || 200;

	if (customCode) {
		result.customCode = customCode;
	}
	if (data) {
		result.data = data
	}
	result.msg = msg;
	result.success = success;
	
	// console.log('**response: ', result)
	return res.status(result.code).json(result);
};