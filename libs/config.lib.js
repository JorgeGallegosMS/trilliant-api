'use strict';

module.exports = class Config {
	constructor(env, configFolderPath) {
		this.env = env;
		this.configFolderPath = configFolderPath;
		
	}

	getConfig(confName) {
		let configName = confName.toLowerCase().trim();
		let path = `${this.configFolderPath}/${this.env}`;

		return `${path}/${configName}.config.json`;
	}

};

