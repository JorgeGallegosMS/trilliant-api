const get = require('lodash/get');

const MobileCodesModel = require('../models/mobilecodes.model');
const errorHandler = require('../services/error-handler.service');
const sendJson = require('../services/message.service');

module.exports = async (req, res, next) => {
  try {
    const code = get(req, 'headers.upload-code') || get(req, 'body.code');
    const reviewTempId = get(req, 'headers.upload-code-review') || get(req, 'body.reviewTempId');
    const isCodeValid = await MobileCodesModel.verifyCodeByReviewId(code, reviewTempId);
    if (!isCodeValid) {
      return sendJson({
        res,
        success: false,
        msg: 'Upload token is invalid',
        code: 401
      });
    }
    return next();
  } catch (err) {
    errorHandler(err, req, res);
  }
};
