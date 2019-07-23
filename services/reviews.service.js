'use strict';
const Reviews = require('../models/reviews.model').ReviewsModel;
const User = require('../models/user.model').UserModel;
const CustomError = require('../libs/custom-error.lib');

module.exports = {
  getReviewsByUrl: async url => {
    try {
      const reviews = await Reviews.find({ url: url });
      if (!reviews.length > 0) {
        throw new CustomError({
          message: 'no images by this url',
          code: 404
        });
      }
      return reviews;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  getAllReviews: async () => {
    try {
      const reviews = await Reviews.find();
      return reviews;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  createReview: async data => {
    try {
      const fields = {
        userId: data.user,
        url: data.url,
        imageUrl: data.imageUrl
      };
      const review = await Reviews.create(fields);
      return review;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  updateReview: async (id, userId, data) => {
    try {
      const fields = Object.assign({}, data); // JSON.parse(JSON.stringify(data)); - to clear null fields, but if this is AJAX, they already deleted;

      const review = await Reviews.updateOne({ _id: id, userId }, { $set: fields });

      return review;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  getReviewImage: async id => {
    try {
      const review = await Reviews.findOne({ _id: id }).lean();
      const imageWithRates = {
        comment: review.comment,
        imageUrls: review.imageUrls,
        overall: review.overall,
        fit: review.fit,
        quality: review.quality,
        shipping: review.shipping,
        shouldDisplay: review.shouldDisplay
      };
      return imageWithRates;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  getReviewById: async id => {
    try {
      const review = Reviews.findOne({ _id: id }).lean();
      if (!review) {
        throw new CustomError({
          message: 'No reviews by this id',
          code: 404
        });
      }
      const user = await User.findOne({ _id: review.userId });

      return {
        ...review,
        links: user.links
      };
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  addReview: async (id, url, imageUrls) => {
    try {
      const fields = {
        userId: id,
        url: url,
        imageUrls: imageUrls.map(url => ({ url, rotate: 0 }))
      };
      const review = await Reviews.create(fields);
      return review;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  rateCommentReview: async (reviewId, data) => {
    try {
      const reviewToUpdate = await Reviews.findOneAndUpdate(
        { _id: reviewId },
        {
          $set: {
            overall: data.overall,
            quality: data.quality,
            fit: data.fit,
            shipping: data.shipping,
            comment: data.comment,
            shouldDisplay: true,
            imageUrls: data.imageUrls,
          }
        }
      );
      await reviewToUpdate.save();
      return reviewToUpdate;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  getRates: async reviewsList => {
    try {
      const sum = await Reviews.aggregate([{ $match: { _id: { $in: reviewsList }, shouldDisplay: true } }]);
      const overallSum =
        sum
          .map(item => {
            return item.overall;
          })
          .reduce((prev, next) => {
            return +prev + +next;
          }) / sum.length;
      const qualitySum =
        sum
          .map(item => {
            return item.quality;
          })
          .reduce((prev, next) => {
            return +prev + +next;
          }) / sum.length;
      const fitSum =
        sum
          .map(item => {
            return item.fit;
          })
          .reduce((prev, next) => {
            return +prev + +next;
          }) / sum.length;
      const shippingSum =
        sum
          .map(item => {
            return item.shipping;
          })
          .reduce((prev, next) => {
            return +prev + +next;
          }) / sum.length;
      const rates = {
        averageOverall: overallSum,
        averageQuality: qualitySum,
        averageFit: fitSum,
        averageShipping: shippingSum
      };
      return rates;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  reviewsByUserId: async userId => {
    try {
      const posts = await Reviews.find({ userId: userId, shouldDisplay: true });
      return posts;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  updateHelpfulValue: async (action, userId, id) => {
    try {
      if (action === 'add') {
        const beforeUpdateReview = await Reviews.findById(id);
        let index = beforeUpdateReview.helpful.includes(userId);
        if (index) {
          throw new CustomError({
            message: 'This user have already like this review',
            code: 409
          });
        }
        const review = await Reviews.findOneAndUpdate({ _id: id }, { $addToSet: { helpful: userId } }, { new: true });
        review.helpfulCount += 1;
        await review.save();
        return review.helpful.length;
      } else if (action === 'remove') {
        const review = await Reviews.findOne({ _id: id });
        let index = review.helpful.findIndex(item => item === userId);
        if (index > -1) {
          review.helpful.splice(index, 1);
        }
        review.helpfulCount -= 1;
        await review.save();
        return review.helpful.length;
      }
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  updateLooksGreatValue: async (action, userId, id) => {
    try {
      if (action === 'add') {
        const beforeUpdateReview = await Reviews.findById(id);
        let index = beforeUpdateReview.looksGreat.includes(userId);
        if (index) {
          throw new CustomError({
            message: 'This user have already like this review',
            code: 409
          });
        }
        const review = await Reviews.findOneAndUpdate(
          { _id: id },
          { $addToSet: { looksGreat: userId } },
          { new: true }
        );
        console.log(review.looksGreatCount, 'BEFORE UPDATE');
        review.looksGreatCount += 1;
        console.log(review.looksGreatCount, 'AFTER UPDATE');
        await review.save();
        return review.looksGreat.length;
      } else if (action === 'remove') {
        const review = await Reviews.findOne({ _id: id });
        let index = review.looksGreat.findIndex(item => item === userId);
        if (index > -1) {
          review.looksGreat.splice(index, 1);
        }
        review.looksGreatCount -= 1;
        await review.save();
        return review.looksGreat.length;
      }
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  updateHelpfulCount: async (action, id) => {
    try {
      const review = await Reviews.findOne({ _id: id });
      if (action === 'remove') {
        review.helpfulCount -= 1;
        await review.save();
        return review.helpfulCount;
      } else if (action === 'add') {
        console.log('#increase count#');
        console.log('########################');
        review.helpfulCount += 1;
        await review.save();
        return review.helpfulCount;
      }
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  updateLooksGreatCount: async (action, id) => {
    try {
      const review = await Reviews.findOne({ _id: id });
      if (action === 'remove') {
        review.looksGreatCount -= 1;
        await review.save();
        return review.looksGreatCount;
      } else if (action === 'add') {
        console.log('#increase count#');
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@');
        console.log(review.looksGreatCount, 'BEFORE INCREASE');
        review.looksGreatCount += 1;
        console.log(review.looksGreatCount, 'AFTER INCREASING');
        await review.save();
        return review.looksGreatCount;
      }
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  deleteReview: async (reviewId, userId) => {
    try {
      const review = await Reviews.findById(reviewId);
      if (review.userId.toString() !== userId.toString()) {
        throw new CustomError({
          message: 'User can\'t delete review updated by other user',
          code: 400
        });
      }
      const deleted = await review.remove();
      console.log(deleted, 'DELETED REVIEW');
      const reviewStats = { looksGreatCount: deleted.looksGreatCount, helpfulCount: deleted.helpfulCount };
      return reviewStats;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  }
};
