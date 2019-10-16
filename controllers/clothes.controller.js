const clothesService = require('../services/clothes.service');
const reviewsService = require('../services/reviews.service');
const errorHandler = require('../services/error-handler.service');
const sendJson = require('../services/message.service');

const ClothModel = require('../models/cloth.model');

const { parseStartLimit } = require('../utils/query');

module.exports = {
  clothReviews: async (req, res) => {
    try {
      const url = req.query.url;
      const clothInfo = await clothesService.getClothByUrl(url);
      return sendJson({
        res,
        data: clothInfo,
        message: 'Cloth info'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  //TODO:
  getClothRatings: async (req, res) => {
    try {
      const url = req.body.url;
      const reviewsUrls = await reviewsService.getReviewsByUrl(urlId);
      const ratings = await reviewsService.getReviewsRating(reviewsUrls);
    } catch (err) {
      err.code = 500;
      console.log(err.code);
      errorHandler(err, req, res);
    }
  },

  getCloths: async (req, res) => {
    try {
      const [start, limit] = parseStartLimit(req.query.range);
      const { sort, sortOrder, search, tags } = req.query;
      const findQuery = {store: { '$nin': [ null, '' ] },}
      if(search) findQuery.name = new RegExp(`.*${search}.*`, 'i')
      if(tags) findQuery.tags = { $in: tags.split(',') }

      const clothes = await ClothModel
        .find(findQuery)
        .sort(sort ? {
          [sort]: sortOrder === 'ASC' ? 1 : -1,
          updatedAt: 'DESC',
        } : {
          updatedAt: 'DESC',
        })
        .populate('reviews')
        .populate({ path: 'reviews', populate: { path: 'userId' } })
        .skip(start)
        .limit(limit);
      const clothesCount = await ClothModel.countDocuments(search ? {
        name: new RegExp(`.*${search}.*`, 'i'),
        store: { '$nin': [ null, '' ] },
      } : {
        store: { '$nin': [ null, '' ] },
      });

      res.setHeader('Content-Range', `clothes 0-${clothes.length}/${clothesCount}`);
      res.setHeader('Content-Total', clothesCount);
      res.contentType('json');
      res.json(clothes);
    } catch (err) {
      errorHandler(err, req, res);
    }
  }
};
