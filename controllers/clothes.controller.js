'use strict';

require('dotenv').config();

const clothesService = require('../services/clothes.service');
const reviewsService = require('../services/reviews.service');
const errorHandler = require('../services/error-handler.service');
const sendJson = require('../services/message.service');

module.exports = {
    clothReviews: async(req, res) => {
        try {
            const url = req.query.url;
            const clothInfo = await clothesService.getClothByUrl(url);
            return sendJson({
                res,
                data: clothInfo,
                message: 'Cloth info'
            })
        } catch(err) {
            errorHandler(err, req, res);
        }
    },

    //TODO:
    getClothRatings: async(req, res) => {
        try {
            const url = req.body.url;
            const reviewsUrls = await reviewsService.getReviewsByUrl(urlId);
            const ratings = await reviewsService.getReviewsRating(reviewsUrls);
        } catch(err) {
            err.code = 500;
            console.log(err.code);
            errorHandler(err, req, res);
        }
    }
};
