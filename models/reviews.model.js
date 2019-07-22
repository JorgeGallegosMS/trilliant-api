'use strict';

const mongoose = require('mongoose');

const ReviewsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    url: {
      type: String
    },
    imageUrls: [
      mongoose.Schema(
        {
          url: String,
          rotate: Number
        },
        { _id: false }
      )
    ],
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
    },
    pictureState: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

const ReviewsModel = mongoose.model('Reviews', ReviewsSchema);

module.exports = { ReviewsModel };
