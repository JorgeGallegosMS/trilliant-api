'use strict';

const mongoose = require('mongoose');

const TokenSchema = mongoose.Schema({
    token: {
        type: String, unique: true
    }
});

const TokenModel = mongoose.model('Token', TokenSchema);

module.exports = {TokenModel};