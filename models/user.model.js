'use stict';

const mongoose = require('mongoose');
const passwordService = require('../services/password.service');

function createUserSchema(fieldsToAdd) {
  const fields = {
    firstName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 200
    },
    lastName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 200
    },
    email: {
      type: String,
      validate: {
        validator: function(value) {
          return /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i.test(value);
        },
        message: props => `${props.value} is not a valid email number!`
      },
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    tokenExpires: {
      type: String,
      default: 1514819559000
    },
    looksGreatCount: {
      type: Number,
      default: 0
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    resetToken: {
      type: String
    },
    links: {
      instagram: {
        url: String,
        userName: String
      },
      twitter: {
        url: String,
        userName: String
      },
      facebook: {
        url: String,
        userName: String
      },
      blog: {
        url: String,
        userName: String
      }
    },
    followers: {
      type: Number,
      default: 0
    },
    about: {
      type: String
    }
  };

  const schema = mongoose.Schema(fields);
  if (fieldsToAdd) {
    schema.add(fieldsToAdd);
  }
  return schema;
}

const UserSchema = createUserSchema();

UserSchema.statics.createHash = passwordService.createHash;

UserSchema.methods.verifyPassword = passwordService.verifyPassword;

const UserModel = mongoose.model('User', UserSchema);

module.exports = { UserModel, createUserSchema };
