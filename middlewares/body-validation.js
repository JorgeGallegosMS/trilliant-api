'use strict';

const sendJson = require('../services/message.service');
const errorHandler = require('../services/error-handler.service');
const { body, validationResult, query, param } = require('express-validator/check');

module.exports = {
    rating: () => {
        return [
            param('id').exists().not().isEmpty().isString(),
            body('url').exists().not().isEmpty().isString()
        ]
    },

    psw: () => {
        return [
            body('password').exists().not().isEmpty().isString().isLength({ min: 4, max: 100 })
        ]
    },

    login: () => {
        return [
            body('password').exists().not().isEmpty().isString().isLength({ min: 4, max: 100 }),
            body('email').isEmail()
        ]
    },

    email: () => {
        return [
            body('email').isEmail(),
        ]
    },

    token: () => {
        return [
            query('token').exists().not().isEmpty()
        ]
    },

    resetPsw: () => {
        return [
            body('token').exists().not().isEmpty(),
            body('password').exists().not().isEmpty().isString().isLength({ min: 4, max: 100 }),
        ]
    },

    result: (req, res, next) => {
        validationResult(req).isEmpty()
          ? next()
          : sendJson(
            {
                res,
                success: false,
                code: 401,
                msg: 'invalid credentials',
                customCode: "401"
            })
    }
}
