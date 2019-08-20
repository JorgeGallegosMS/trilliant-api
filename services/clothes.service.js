'use strict';

const Clothes = require('../models/cloth.model');
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

const getOldRateValue = (avgValue, deleteValue, currentCount) => {
  if (deleteValue === -1) {
    return avgValue;
  }

  if (avgValue === -1) {
    return avgValue;
  }

  return Math.round((avgValue * currentCount - deleteValue) / (currentCount - 1))
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

  deleteReviewFromCloth: async (reviewId, deletedReviewStats) => {
    try {
      const cloth = await Clothes.findOne({ reviews: reviewId });      
      const validReviewsCount = cloth.reviews.filter(review => review.shouldDisplay).length
      cloth.reviews = cloth.reviews.filter(item => item.toString() !== reviewId.toString());      
      cloth.looksGreatCount -= deletedReviewStats.looksGreatCount;
      cloth.helpfulCount -= deletedReviewStats.helpfulCount;      

      cloth.averageOverall = getOldRateValue(cloth.averageOverall, deletedReviewStats.overall, validReviewsCount);
      cloth.averageQuality = getOldRateValue(cloth.averageQuality, deletedReviewStats.quality, validReviewsCount);
      cloth.averageFit = getOldRateValue(cloth.averageFit, deletedReviewStats.fit, validReviewsCount);
      cloth.averageShipping = getOldRateValue(cloth.averageShipping, deletedReviewStats.shipping, validReviewsCount);
      
      await cloth.save();
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  }
};
