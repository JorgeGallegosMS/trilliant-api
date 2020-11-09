'use strict';

const User = require('../models/user.model').UserModel;
const Token = require('../models/token.model').TokenModel;
const CustomError = require('../libs/custom-error.lib');
const _ = require('lodash');

module.exports = {
  createUser: async data => {
    try {
      let fields = {
        firstName: data.firstname,
        lastName: data.lastname,
        email: data.email,
        about: data.about
      };
      const hash = await User.createHash(data.password);
      fields.password = hash;
      const user = await User.create(fields);
      return user;
    } catch (err) {
      let msg = err.message;
      if (err.message.indexOf('E11000') > -1) {
        msg = 'user exists';
      }
      throw new CustomError({
        message: msg,
        code: 409,
        customCode: 409
      });
    }
  },

  addSocialLinks: async (id, links) => {
    const foundedUser = await User.findOne({ _id: id });
    if (!foundedUser) {
      throw new CustomError({
        message: 'No user',
        code: 404
      });
    }
    foundedUser.links = links;
    const savedUser = await foundedUser.save();
    return savedUser;
  },

  deleteSocialLinks: async (id, links) => {
    const foundedUser = await User.findOne({ _id: id });
    if (!foundedUser) {
      throw new CustomError({
        message: 'No user',
        code: 404
      });
    }
    if (!links || links === { '': {} }) {
      return foundedUser;
    }
    foundedUser.links = _.assign(foundedUser.links, links);
    const savedUser = await foundedUser.save();
    return savedUser;
  },

  getUserByResetToken: async token => {
    try {
      const user = await User.findOne({ resetToken: token });
      if (!user) {
        throw new CustomError({
          message: 'no user by this resetToken',
          code: 404,
          customCode: '404'
        });
      }
      return user;
    } catch (err) {
      throw new CustomError({
        message: 'no user by this email',
        code: err.code,
        customCode: err.customCode
      });
    }
  },

  byName: async name => {
    try {
      const user = await User.findOne({ email: name });
      if (!user) {
        throw new CustomError({
          message: 'No user',
          code: 404
        });
      }
      return user;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code,
        customCode: err.customCode
      });
    }
  },

  getUserByEmail: async email => {
    try {
      const user = await User.findOne({ email: email });
      //TODO:
      if (!user) {
        throw new CustomError({
          message: 'This email is not yet registered.',
          code: 404,
          customCode: '404'
        });
      }
      return user;
    } catch (err) {
      throw new CustomError({
        message: 'This email is not yet registered.',
        code: err.code,
        customCode: err.customCode
      });
    }
  },

  getUserByResetToken: async token => {
    try {
      const user = await User.findOne({ resetToken: token });
      if (!user) {
        throw new CustomError({
          message: 'no user by this resetToken',
          code: 404,
          customCode: '404'
        });
      }
      return user;
    } catch (err) {
      throw new CustomError({
        message: 'no user by this email',
        code: err.code,
        customCode: err.customCode
      });
    }
  },

  getUserById: async id => {
    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        throw new CustomError({
          message: 'no user by this id',
          code: 404,
          customCode: '404'
        });
      }
      const { password, ...filtredUser } = user._doc;
      return filtredUser;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  removeDeletedReviewStatsFromUserModel: async (userId, deletedReviewStats) => {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { looksGreatCount: -deletedReviewStats.looksGreatCount, helpfulCount: -deletedReviewStats.helpfulCount }
      });
      return;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  createNewTokenRecord: async cryptedToken => {
    try {
      let fields = {
        token: cryptedToken
      };
      const finded = await Token.findOne({ token: cryptedToken });
      if (finded) {
        return false;
      }
      const token = await Token.create(fields);
      return true;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  validateTokenExpiresTime: async token => {
    try {
      // const user =
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },

  updateTokenTime: async (id, newTime) => {
    try {
      await User.findOneAndUpdate({ _id: id }, { $set: { tokenExpires: newTime } });
      return;
    } catch (err) {
      throw new CustomError({
        message: err.message,
        code: err.code
      });
    }
  },  
};
