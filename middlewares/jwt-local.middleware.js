'use strict';
const jwtService = require('../services/jwt.service');
const errorHandler = require('../services/error-handler.service');
const sendJson = require('../services/message.service');

module.exports = {
    verifyToken: async(req, res, next) => {
                
        try {
            const token = req.headers['x-access-token'];
            if (!token) {
                res.status(401);
                return sendJson({
					res,
					success: false,
					msg: 'no verifying local token',
					code: 401,
					customCode: "305"
				});
            }
            const decoded = await jwtService('login').verify(token);
            req.decodedToken = decoded;
            return next();
        } catch(err) {
            errorHandler(err, req, res);
        }
    }
}