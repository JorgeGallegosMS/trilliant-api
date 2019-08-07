'use strict';

const mongoose = require('mongoose');

const ClothSchema = mongoose.Schema({
  url: {
    type: String
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reviews' }],
  averageOverall: {
    type: Number,
    default: -1
  },
  averageQuality: {
    type: Number,
    default: -1
  },
  averageFit: {
    type: Number,
    default: -1
  },
  averageShipping: {
    type: Number,
    default: -1
  },
  price: {
    type: Number,
    default: 0,
  },
  store: {
    type: String,
  },
  name: {
    type: String,
  },
});

const ClothModel = mongoose.model('Clothes', ClothSchema);

module.exports = ClothModel;
