'use strict';

const Clothes = require('../models/cloth.model').ClothModel;
const CustomError = require('../libs/custom-error.lib');
const _ = require('lodash');

const getNewRateValue = (avgValue, newValue, newCount) => {
  if (newValue === -1) {
    return avgValue;
  }

  if (avgValue === -1) {
    return newValue;
  }

  return Math.round(avgValue + (newValue - avgValue) / (newCount));
}

module.exports = {
  getClothByUrl: async url => {
    try {
      const cloth = await Clothes.findOne({ url: url })
        .populate('reviews')
        .populate({ path: 'reviews', populate: { path: 'userId' } })
        .lean();
      if (!cloth) {
        throw new CustomError({
          message: 'No clothes by this url',
          code: 404
        });
      }
      return {
        ...cloth,
        reviews: cloth.reviews.filter(review => review.shouldDisplay),
      };
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  updateCloth: async (reviewId, clothUrl) => {
    try {
      const cloth = await Clothes.findOne({ url: clothUrl });
      if (!cloth) {
        const fields = {
          url: clothUrl,
          reviews: [reviewId]
        };
        const createdCloth = await Clothes.create(fields);
        return createdCloth;
      }
      cloth.reviews.push(reviewId);
      return cloth.save();
    } catch (err) {
      throw new CustomError({
        message: 'Cant update Clothes Model',
        code: 500
      });
    }
  },

  updateRates: async data => {
    try {
      const ratings = {
        overall: data.overall,
        quality: data.quality,
        fit: data.fit,
        shipping: data.shipping
      };

      const cloth = await Clothes.findOne({ url: data.url }).populate('reviews');

      const validReviewsCount = cloth.reviews.filter(review => review.shouldDisplay).length

      cloth.averageOverall = getNewRateValue(cloth.averageOverall, ratings.overall, validReviewsCount);
      cloth.averageQuality = getNewRateValue(cloth.averageQuality, ratings.quality, validReviewsCount);
      cloth.averageFit = getNewRateValue(cloth.averageFit, ratings.fit, validReviewsCount);
      cloth.averageShipping = getNewRateValue(cloth.averageShipping, ratings.shipping, validReviewsCount);
      return cloth.save();
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  deleteReviewFromCloth: async reviewId => {
    try {
      let cloth = await Clothes.findOne({ reviews: reviewId });
      console.log(cloth.reviews, 'BEFORE');
      cloth.reviews = cloth.reviews.filter(item => item.toString() !== reviewId.toString());
      console.log(cloth.reviews, 'REMOVED');
      await cloth.save();
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  }
};
