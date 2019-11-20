'use strict';

require('dotenv').config();

const nanoid = require('nanoid');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const userService = require('../services/user.service');
const errorHandler = require('../services/error-handler.service');
const sendJson = require('../services/message.service');
const jwtService = require('../services/jwt.service');
const reviewsService = require('../services/reviews.service');
const imageService = require('../services/image.service');
const { createHash } = require('../services/password.service');
const mailSender = require('../services/mail.service');

const MobileCodesModel = require('../models/mobilecodes.model');

const welcomeHTML = fs.readFileSync(path.join(__dirname, '../templates/welcome_email.html'));

module.exports = {
  forgotPsw: async (req, res, next) => {
    try {
      const user = await userService.getUserByEmail(req.body.email);
      let isCreated = false;

      let cryptoToken, newDateObj;

      do {
        cryptoToken = nanoid(8);
        newDateObj = Date.parse(moment(Date.now()).add(1, 'h'));
        isCreated = await userService.createNewTokenRecord(cryptoToken, newDateObj);
      } while (!isCreated);

      await userService.updateTokenTime(user._id, newDateObj);

      user.resetToken = cryptoToken;
      user.save(err => console.log('Err while saving:', err));

      const msg = `
			<div style = "background-color: lightgrey; border-radius: 10px">
			<h1 style = "padding: 10px; text-align: center">Info from Trilliant</h1>
			<div style = "padding: 10px; font-size: 18px; text-align: center">Your code is <h5 style ='color: red'> ${cryptoToken}</h5></div>
			<p style = "padding: 10px; font-size: 18px; text-align: center">You have 1 hour to change your password!</p>
			</div>
			`;

      mailSender(user.email, msg, 'Trilliant -    Reset    Your Password');

      return sendJson({
        res,
        msg: `Message was send to ${user.email} with some token` // deleted ${token} in security purposes
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  linkToReset: async (req, res, next) => {
    try {
      const token = req.query.token;
      // const decoded = await jwtService('resetPsw').verify(token);
      const user = await userService.getUserByResetToken(token);
      console.log('@@');
      // const restoreToken = await jwtService('resetPsw').sign({email: user.email, _id: user._id, name: user.firstName});
      // const user = await userService.getUserByEmail(decoded.email);

      if (token === user.resetToken) {
        return sendJson({
          res,
          data: {
            pswToken: token
          },
          msg: 'Password link is OK'
        });
      } else {
        return sendJson({
          res,
          code: 400,
          msg: 'Tokens are not equal',
          success: false
        });
      }
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  resetPsw: async (req, res, next) => {
    try {
      let token = req.body.token;
      const user = await userService.getUserByResetToken(token);

      if (token === user.resetToken && user.tokenExpires > Date.now()) {
        const hash = await createHash(req.body.password);
        user.password = hash;
        user.resetToken = '';
        user.save(err => console.log(err));

        const msg = '<h2>Your code was changed</h2>';

        mailSender(user.email, msg);

        return sendJson({
          res,
          msg: 'New Password is set'
        });
      } else {
        return sendJson({
          res,
          code: 400,
          msg: 'Tokens validation error',
          success: false
        });
      }
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  create: async (req, res, next) => {
    try {
      const data = Object.assign({}, req.body);
      const user = await userService.createUser(data);

      const token = await jwtService('login').sign({ email: user.email, _id: user._id, name: user.firstName });
      const refToken = await jwtService().signRefreshToken({ email: user.email, _id: user._id, name: user.firstName });

      mailSender(user.email, welcomeHTML, 'Welcome to Trilliant');

      return sendJson({
        res,
        data: {
          localToken: token,
          refreshToken: refToken
        },
        msg: 'User succesfully registred'
      });
    } catch (err) {
      err.code = 400;
      errorHandler(err, req, res);
    }
  },

  authenticateUser: async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const user = await userService.getUserByEmail(email);

      await user.verifyPassword(password);

      const token = await jwtService('login').sign({ email: user.email, _id: user._id, name: user.firstName });
      const refToken = await jwtService().signRefreshToken({ email: user.email, _id: user._id, name: user.firstName });
      return sendJson({
        res,
        data: {
          localToken: token,
          refreshToken: refToken,
          isAdmin: user.isAdmin,
        },
        msg: 'User logged in',
        redirect: '/api/user/profile'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  byUsername: async (req, res) => {
    try {
      const name = req.query.name;
      const user = await userService.byName(name);

      return sendJson({
        res,
        data: user,
        msg: 'User'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  getOneUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
      const userInitials = {
        name: user.firstName,
        lastname: user.lastName
      };
      return sendJson({
        res,
        data: userInitials,
        msg: 'User initials'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  userProfile: async (req, res) => {
    try {
      const userId = req.decodedToken._id;
      const reviews = await reviewsService.reviewsByUserId(userId);
      const user = await userService.getUserById(userId);
      return sendJson({
        res,
        data: {
          user: user,
          reviews: reviews,
          count: reviews.length
        },
        msg: 'Reviews and their count'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  getOtherUserProfile: async (req, res) => {
    try {
      const id = req.params.id;
      const userReviews = await reviewsService.reviewsByUserId(id);
      const user = await userService.getUserById(id);
      return sendJson({
        res,
        data: {
          user: user,
          reviews: userReviews,
          count: userReviews.length
        },
        msg: 'Other user profile'
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  addSocialLinks: async (req, res, next) => {
    try {
      const user = await userService.addSocialLinks(req.decodedToken._id, req.body);
      return sendJson({
        res,
        data: {
          user
        }
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  deleteSocialLinks: async (req, res, next) => {
    try {
      const user = await userService.deleteSocialLinks(req.decodedToken._id, req.body);
      return sendJson({
        res,
        data: {
          user
        }
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  generateUploadCode: async (req, res) => {
    try {
      const userId = req.decodedToken._id;
      const { url, reviewTempId } = req.body;

      const unusedCode = await MobileCodesModel.findOne({
        isUsed: false,
        userId,
        url
      });

      if (unusedCode) {
        unusedCode.reviewTempId = reviewTempId;
        await unusedCode.save();

        return sendJson({
          res,
          data: unusedCode
        });
      }

      const code = await MobileCodesModel.generateCode(userId, url, reviewTempId);
      return sendJson({
        res,
        data: code
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  },

  verifytUploadCode: async (req, res) => {
    try {
      const code = req.params.code;

      const existingCode = await MobileCodesModel.verifyAndGetCode(code);
      await imageService.deleteTempImagesByReviewTempId(existingCode.reviewTempId);

      return sendJson({
        res,
        data: existingCode
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  }
};
