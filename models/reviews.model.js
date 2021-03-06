'use strict';

const mongoose = require('mongoose');

const ReviewsSchema = mongoose.Schema(
  {
    reviewTempId: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    url: {
      type: String,
      required: true,
    },
    imageUrls: [
      mongoose.Schema(
        {
          url: String,
          rotate: Number,
          isThumbnail: Boolean,
        },
        { _id: false }
      )
    ],
    overall: {
      type: Number,
      default: 60
    },
    quality: {
      type: Number,
      default: 60
    },
    fit: {
      type: Number,
      default: 60
    },
    shipping: {
      type: Number,
      default: 60
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
  },
  {
    timestamps: true
  }
);

const ReviewsModel = mongoose.model('Reviews', ReviewsSchema);

module.exports = { ReviewsModel };
