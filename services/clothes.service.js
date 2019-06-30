'use strict';

const Clothes = require('../models/cloth.model').ClothModel;
const CustomError = require('../libs/custom-error.lib');
const _ = require('lodash');

module.exports = {
    getClothByUrl: async(url) => {
        try {
            const cloth = await Clothes.findOne({url: url});
            if (!cloth) {
                throw new CustomError({
                    message: 'No clothes by this url',
                    code: 404
                })
            }
            return cloth;
        } catch(err) {
            throw new CustomError({
				message: err.message,
				code: err.code
			});
        }
    },

    updateCloth: async(reviewId, clothUrl) => {
        try {
            const cloth = await Clothes.findOne({url: clothUrl});
            if (!cloth) {
                const fields = {
                    url: clothUrl,
                    reviews: [reviewId]
                }
                const createdCloth = await Clothes.create(fields);
                return createdCloth;
            }
            cloth.reviews.push(reviewId);
            return cloth.save();
        } catch(err) {
            throw new CustomError({
				message: "Cant update Clothes Model",
				code: 500
			});
        }
    },

    updateRates: async(data) => {
        try {
            const ratings = {
                overall: data.overall,
                quality: data.quality,
                fit: data.fit,
                shipping: data.shipping
            }
            const cloth = await Clothes.findOne({url: data.url});
            cloth.avarageOverall = (+cloth.avarageOverall + +ratings.overall) / cloth.reviews.length;
            cloth.averageQuality = (+cloth.averageQuality + +ratings.quality) / cloth.reviews.length;
            cloth.averageFit = (+cloth.averageFit + +ratings.fit) / cloth.reviews.length;
            cloth.averageShipping = (+cloth.averageShipping + +ratings.shipping) / cloth.reviews.length;
            return cloth.save();
        } catch(err) {
            throw new CustomError({
                message: err.message,
                code: err.code
            })
        }
    },

    deleteReviewFromCloth: async(reviewId) => {
        try {
            let cloth = await Clothes.findOne({reviews: reviewId});
            console.log(cloth.reviews, 'BEFORE')
            cloth.reviews = cloth.reviews.filter(item => item.toString() !== reviewId.toString());
            console.log(cloth.reviews, 'REMOVED');
            await cloth.save()
        } catch(err) {
            throw new CustomError({
                message: err.message,
                code: err.code
            })
        }
    }
};
