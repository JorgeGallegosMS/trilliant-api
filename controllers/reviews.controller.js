const get = require('lodash/get');

const reviewsService = require('../services/reviews.service');
const clothesService = require('../services/clothes.service');
const errorHandler = require('../services/error-handler.service');
const sendJson = require('../services/message.service');
const userService = require('../services/user.service');
const imageService = require('../services/image.service');
const ratesService = require('../services/rates.service');

module.exports = {
  showUserReviews: async (req, res) => {
    try {
      const url = req.body.url;
      const reviewsList = await reviewsService.getReviewsByUrl(url);
      return sendJson({
        res,
        data: {
          reviews: reviewsList
        },
        msg: 'List of reviews'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  allReviews: async (req, res) => {
    try {
      const reviews = await reviewsService.getAllReviews();
      return sendJson({
        res,
        data: {
          reviews: reviews
        },
        msg: 'All reviews'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  removeTempReviewImage: async (req, res) => {
    try {
      const {
        data: { _id: imageId }
      } = req.body;

      await imageService.deleteTempImageById(imageId);
      return sendJson({
        res,
        msg: 'Image succesfully deleted'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  addTempReviewImage: async (req, res) => {
    try {
      const { reviewTempId } = req.body;
      const { filename } = get(req, 'files[0]', {});

      const image = await imageService.saveTempImageData({
        filename,
        reviewTempId
      });
      return sendJson({
        res,
        data: image.toObject(),
        msg: 'Image succesfully uploaded'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  addReview: async (req, res) => {
    try {
      const userId = req.decodedToken._id;
      const { reviewTempId } = req.body;
      const url = req.headers['url'];

      const reviewImageURLs = await imageService.uploadReviewImagesToCloudinary(reviewTempId);      
      const uploaded = await reviewsService.addReview(userId, url, reviewImageURLs);
      await clothesService.updateCloth(uploaded._id, url);
      return sendJson({
        res,
        data: uploaded,
        msg: 'Image succesfully uploaded'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  updateReview: async (req, res) => {
    try {
      const userId = req.decodedToken._id;
      const reviewId = req.params.id;
      const data = Object.assign({}, req.body);

      const updated = await reviewsService.updateReview(reviewId, userId, data);
      return sendJson({
        res,
        data: updated,
        msg: 'Review info updated'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  getOneReviewImage: async (req, res) => {
    try {
      const id = req.params.id;
      const reviewImage = await reviewsService.getReviewImage(id);
      return sendJson({
        res,
        data: {
          review: reviewImage
        },
        msg: 'Image Url'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  getParticularReview: async (req, res) => {
    try {
      const id = req.params.id;
      const review = await reviewsService.getReviewById(id);
      return sendJson({
        res,
        data: review,
        msg: 'All review Info'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  rateAndCommentReview: async (req, res) => {
    try {
      const reviewId = req.params.id;
      const data = Object.assign({}, req.body);
      const ratedReview = await reviewsService.rateCommentReview(reviewId, data);
      await clothesService.updateRates(data);
      return sendJson({
        res,
        data: ratedReview,
        msg: 'Review rated succesfully'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  upload: async (req, res) => {
    try {
      return res.json('UPLOADED');
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  helpfulUpdate: async (req, res) => {
    try {
      const reviewId = req.params.id;      
      const userId = req.decodedToken._id;
      const action = req.body.helpful;

      const helpfulCount = await ratesService.updateRate(action, 'helpful', userId, reviewId);
      return sendJson({
        res,
        data: { helpfulCount },
        msg: 'Helpful value updated!'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  looksGreatUpdate: async (req, res) => {
    try {
      const reviewId = req.params.id;      
      const userId = req.decodedToken._id;
      const action = req.body.looksGreat;

      const looksGreatCount = await ratesService.updateRate(action, 'looksGreat', userId, reviewId);
      return sendJson({
        res,
        data: { looksGreatCount },
        msg: 'Looks great value updated!'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  }, 

  deleteReview: async (req, res) => {
    try {
      const reviewId = req.params.id;
      const userId = req.decodedToken._id;
      const deletedReviewStats = await reviewsService.deleteReview(reviewId, userId);
      await clothesService.deleteReviewFromCloth(reviewId, deletedReviewStats);
      await userService.removeDeletedReviewStatsFromUserModel(userId, deletedReviewStats);
      return sendJson({
        res,
        msg: 'Review deleted'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  }
};
