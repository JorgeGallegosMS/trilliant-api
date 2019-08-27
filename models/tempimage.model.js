'use strict';

const mongoose = require('mongoose');

const TempImageSchema = mongoose.Schema(
  {
    reviewTempId: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    isThumbnail: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true
  }
);

const TempImageModel = mongoose.model('TempImages', TempImageSchema);

module.exports = { TempImageModel };
