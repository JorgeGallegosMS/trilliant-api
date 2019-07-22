'use strict';

const { body, validationResult, query, param, oneOf } = require('express-validator/check');
const sendJson = require('../services/message.service');

module.exports = {
  rating: () => {
    return [
      param('id')
        .exists()
        .not()
        .isEmpty()
        .isString(),
      body('url')
        .exists()
        .not()
        .isEmpty()
        .isString()
    ];
  },

  psw: () => {
    return [
      body('password')
        .exists()
        .not()
        .isEmpty()
        .isString()
        .isLength({ min: 4, max: 100 })
    ];
  },

  login: () => {
    return [
      body('password')
        .exists()
        .not()
        .isEmpty()
        .isString()
        .isLength({ min: 4, max: 100 }),
      body('email').isEmail()
    ];
  },

  email: () => {
    return [body('email').isEmail()];
  },

  token: () => {
    return [
      query('token')
        .exists()
        .not()
        .isEmpty()
    ];
  },

  resetPsw: () => {
    return [
      body('token')
        .exists()
        .not()
        .isEmpty(),
      body('password')
        .exists()
        .not()
        .isEmpty()
        .isString()
        .isLength({ min: 4, max: 100 })
    ];
  },

  addSocialLinks: () => {
    return oneOf([
      [
        body('instagram.userName')
          .exists()
          .not()
          .isEmpty()
          .isString(),
        body('instagram.url')
          .exists()
          .not()
          .isEmpty()
          .isURL()
          .custom(value => {
            return /.*instagram.*/i.test(value);
          })
      ],
      [
        body('facebook.userName')
          .exists()
          .not()
          .isEmpty()
          .isString(),
        body('facebook.url')
          .exists()
          .not()
          .isEmpty()
          .isURL()
          .custom(value => {
            return /.*facebook.*/i.test(value);
          })
      ],
      [
        body('twitter.userName')
          .exists()
          .not()
          .isEmpty()
          .isString(),
        body('twitter.url')
          .exists()
          .not()
          .isEmpty()
          .isURL()
          .custom(value => {
            return /.*twitter.*/i.test(value);
          })
      ],
      [
        body('blog.userName')
          .exists()
          .not()
          .isEmpty()
          .isString(),
        body('blog.url')
          .exists()
          .not()
          .isEmpty()
          .isURL()
      ]
    ]);
  },

  result: (req, res, next) => {
    validationResult(req).isEmpty()
      ? next()
      : sendJson({
          res,
          success: false,
          code: 401,
          msg: 'invalid credentials',
          customCode: '401'
        });
  }
};
