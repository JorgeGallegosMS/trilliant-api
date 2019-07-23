'use strict';

const mongoose = require('mongoose');

const ClothSchema = mongoose.Schema({
  url: {
    type: String
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reviews' }],
  averageOverall: {
    type: Number,
    default: 0
  },
  averageQuality: {
    type: Number,
    default: 0
  },
  averageFit: {
    type: Number,
    default: 0
  },
  averageShipping: {
    type: Number,
    default: 0
  }
});

const ClothModel = mongoose.model('Clothes', ClothSchema);

module.exports = { ClothModel };
