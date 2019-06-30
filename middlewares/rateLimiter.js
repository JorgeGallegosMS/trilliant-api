const rateLimit = require("express-rate-limit");

const sendJson = require('../services/message.service');
const errorHandler = require('../services/error-handler.service');

 
const apiLimiter = (req, res, next) => {
    return rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minutes
            max: 5,
            handler: function(req, res, next) {
                let err = {};
                err.code = 500;
                err.msg = 'rate limiter';
                next(err)
            }})
    }

module.exports = apiLimiter;
