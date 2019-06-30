'use strict';

const mongoose = require('mongoose');

module.exports = (url) => {
	if(!url) {
		url = process.env.MONGOLAB_CYAN_URI || dbConfig.db_url;
	}
	return mongoose.connect(url, {useNewUrlParser: true, useCreateIndex: true});
};


