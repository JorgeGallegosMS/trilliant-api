'use strict';

const mongoose = require('mongoose');

const ReviewsSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 'ref': 'User'
    },
    url: {
        type: String
    },
    imageUrl: {
        type: String
    },
    overall: {
        type: Number,
        default: 5
    },
    quality: {
        type: Number,
        default: 5
    },
    fit: {
        type: Number,
        default: 5
    },
    shipping: {
        type: Number,
        default: 5
    },
    looksGreatCount: {
        type: Number,
        default: 0
    },
    helpfulCount: {
        type: Number, 
        default: 0
    },
    looksGreat: [
        {
            type: String
        }
    ],
    helpful: [
        {
            type: String
        }
    ],
    comment: {
        type: String
    },
    shouldDisplay: {
        type: Boolean,
        default: false
    }
});

const ReviewsModel = mongoose.model('Reviews', ReviewsSchema);

module.exports = {ReviewsModel};