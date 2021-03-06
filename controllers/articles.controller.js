const get = require('lodash/get');

const ArticleModel = require('../models/article.model');
const sendJson = require('../services/message.service');
const errorHandler = require('../services/error-handler.service');

const { API_LIST_REQUEST_DEFAULT_LIMIT } = require('../constants/api');

const parseStartLimit = range => {
  const rangeStripped = String(range).replace(/[\[\]]/g, '');
  if (!rangeStripped) {
    return [0, API_LIST_REQUEST_DEFAULT_LIMIT];
  }

  const [start, end] = rangeStripped.split(',');

  const resultStart = parseInt(start, 10) || 0;

  return [resultStart, parseInt(end, 10) ? parseInt(end, 10) - resultStart + 1 : API_LIST_REQUEST_DEFAULT_LIMIT];
};

module.exports = {
  getArticles: async (req, res) => {
    try {
      const [start, limit] = parseStartLimit(req.query.range);

      const articles = await ArticleModel.find()
        .skip(start)
        .limit(limit);
      const articlesCount = await ArticleModel.countDocuments();

      res.setHeader('Content-Range', `articles 0-${articles.length}/${articlesCount}`);
      res.contentType('json');
      res.json(articles);
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  getArticle: async (req, res) => {
    try {
      const articleId = req.params.id;
      const article = await ArticleModel.findById(articleId);

      if (!article) {
        return sendJson({
          res,
          code: 404,
          msg: 'Article not found',
          success: false
        });
      }

      return res.json({
        ...article.toJSON(),
        id: article._id
      });
    } catch (err) {
      err.code = 500;
      errorHandler(err, req, res);
    }
  },

  addArticle: async (req, res) => {
    try {
      const { text, title, subtitle } = req.body;

      const imageUrl = req.cloudinaryFileData.secure_url;

      const newArticle = new ArticleModel({
        text,
        title,
        subtitle,
        imageUrl
      });

      await newArticle.save();

      return sendJson({
        res,
        data: {
          ...newArticle.toJSON(),
          id: newArticle._id
        },
        msg: 'Article created'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  updateArticle: async (req, res) => {
    try {
      const articleId = req.params.id;
      const { text, title, subtitle } = req.body;

      const imageUrl = get(req, 'result.secure_url');

      const updateData = {
        text,
        title,
        subtitle
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      const updatedArticle = await ArticleModel.findOneAndUpdate({ _id: articleId }, updateData);

      return sendJson({
        res,
        data: {
          ...updatedArticle.toJSON(),
          id: updatedArticle._id
        },
        msg: 'Article updated'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  deleteArticle: async (req, res) => {
    try {
      const articleId = req.params.id;
      const articleToDelete = await ArticleModel.findById(articleId);

      if (!articleToDelete) {
        return sendJson({
          res,
          code: 404,
          msg: 'Article not found',
          success: false
        });
      }

      await articleToDelete.remove();

      return res.json({
        ...articleToDelete.toJSON(),
        id: articleToDelete._id
      });
    } catch (err) {
      err.code = 500;
      errorHandler(err, req, res);
    }
  }
};
