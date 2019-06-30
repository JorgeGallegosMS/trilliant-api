'use strict';

require('dotenv').config();

const reviewsService = require('../services/reviews.service');
const clothesService = require('../services/clothes.service');
const errorHandler = require('../services/error-handler.service');
const sendJson = require('../services/message.service');
const userService = require('../services/user.service');

module.exports = {
    showUserReviews: async(req, res) => {
        try {
            const url = req.body.url;
            const reviewsList = await reviewsService.getReviewsByUrl(url);
            return sendJson({
                res,
                data: {
                    reviews: reviewsList
                },
                msg: 'List of reviews'
            })
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

    allReviews: async(req, res) => {
        try {
            const reviews = await reviewsService.getAllReviews();
            return sendJson({
                res,
                data: {
                    reviews: reviews
                },
                msg: 'All reviews'
            })
        } catch(err) {
            errorHandler(err, req, res)
        }
    },

    addReview: async(req, res) => {
        try {
            const data = Object.assign({}, req.body);
            const review = await reviewsService.createReview(data);
            await clothesService.updateCloth(review._id, data.url);
            return sendJson({
                res,
                data: {
                    url: review
                },
                msg: 'Review added'
            });
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

    addNewOne: async(req, res) => {
        try {
            const userId = req.decodedToken._id;
            const filename = req.result.secure_url;
            const url = req.headers['url'];
            
            const uploaded = await reviewsService.uploadImage(userId, url, filename);
            await clothesService.updateCloth(uploaded._id, url);
            return sendJson({
                res,
                data: uploaded,
                msg: 'Image succesfully uploaded'
            })
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

    updateReview: async(req, res) => {
        try {
            const userId = req.decodedToken._id;
            const reviewId = req.params.id;
            const data = Object.assign({}, req.body);

            const updated = await reviewsService.updateReview(reviewId, userId, data);
            return sendJson({
                res,
                data: updated,
                msg: 'Review info updated'
            })
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

    getOneReviewImage: async(req, res) => {
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
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

    getParticularReview: async(req, res) => {
        try {
            const id = req.params.id;
            const review = await reviewsService.getReviewById(id);
            return sendJson({
                res,
                data: review,
                msg: 'All review Info'
            })
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

    rateAndCommentReview: async(req, res) => {
        try {
            const reviewId = req.params.id;
            const data = Object.assign({}, req.body);
            const ratedReview = await reviewsService.rateCommentReview(reviewId, data);
            // await clothesService.updateRates(data);
            return sendJson({
                res,
                data: ratedReview,
                msg: 'Review rated succesfully'
            })
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

    upload: async(req, res) => {
        try {
            return res.json('UPLOADED')
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

	helpfulUpdate: async(req, res) => {
		try {
            const reviewId = req.params.id;
            // const userId = req.body.userId;
            const userId = req.decodedToken._id;
			const action = req.body.helpful;
			
			const helpfulCount = await reviewsService.updateHelpfulValue(action, userId, reviewId);
			return sendJson({
				res,
				data: {helpfulCount: helpfulCount},
				msg: 'Helpful value updated!'
			})
		} catch(err) {
			errorHandler(err, req, res);
		}
	},

	looksGreatUpdate: async(req, res) => {
		try {
            const reviewId = req.params.id;
            // const userId = req.body.userId;
            const userId = req.decodedToken._id;
			const action = req.body.looksGreat;
			
            const looksGreatCount = await reviewsService.updateLooksGreatValue(action, userId, reviewId);
            console.log(looksGreatCount, 'ANSEWER')
			return sendJson({
				res,
				data: {looksGreatCount: looksGreatCount},
				msg: 'Looks great value updated!'
			})
		} catch(err) {
			errorHandler(err, req, res);
		}
	},

	helpfulCountUpdate: async(req, res) => {
		try {
			const userId = req.params.id;
			const action = req.body.helpful;
						
			const helpfulCount = await reviewsService.updateHelpfulCount(action, userId);
			return sendJson({
				res,
				data: helpfulCount,
				msg: 'Helpful value updated!'
			})
		} catch(err) {
			errorHandler(err, req, res);
		}
	},

	looksGreatCountUpdate: async(req, res) => {
		try {
			const userId = req.params.id;
			const action = req.body.looksGreat;
						
			const looksGreatCount = await reviewsService.updateLooksGreatCount(action, userId);
			return sendJson({
				res,
				data: looksGreatCount,
				msg: 'Looks great value updated!'
			})
		} catch(err) {
			errorHandler(err, req, res);
		}
    },
    
    deleteReview: async(req, res) => {
        try {
            const reviewId = req.params.id;
            const userId = req.decodedToken._id;
            const deletedReviewStats = await reviewsService.deleteReview(reviewId, userId);
            await clothesService.deleteReviewFromCloth(reviewId);
            await userService.removeDeletedReviewStatsFromUserModel(userId, deletedReviewStats);
            return sendJson({
                res,
				msg: 'Review deleted'
            })
        } catch(err) {
            errorHandler(err, req, res);
        }
    }
};
