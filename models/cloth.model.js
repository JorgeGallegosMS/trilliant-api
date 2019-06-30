'use strict';

const mongoose = require('mongoose');

const ClothSchema = mongoose.Schema({
    url: {
        type: String
    },
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reviews'}],
    averageOverall: {
        type: Number
    },
    averageQuality: {
        type: Number
    },
    averageFit: {
        type: Number
    },
    averageFit: {
        type: Number
    },
    averageShipping: {
        type: Number
    }
});

const ClothModel = mongoose.model('Clothes', ClothSchema);

module.exports = {ClothModel};