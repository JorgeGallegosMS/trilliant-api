const generate = require('nanoid/generate');
const nanoid = require('nanoid');
const dictionary = require('nanoid-dictionary');
const mongoose = require('mongoose');

const CustomError = require('../libs/custom-error.lib');

const generateShortCode = () => generate(dictionary.lowercase + dictionary.uppercase + dictionary.numbers, 4);

const MobileCodesSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    url: {
      type: String,
      required: true,
    },
    reviewTempId: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

MobileCodesSchema.statics.generateCode = async function(userId, url, reviewTempId) {
  if (!userId) {
    throw new Error('Missing userId when generating mobile upload code');
  }

  if (!url) {
    throw new Error('Missing cloth url when generating mobile upload code');
  }

  let code = generateShortCode();
  let attemptsLeft = 5;
  let codeExists = await this.findOne({ code });
  while (attemptsLeft && codeExists) {
    code = generateShortCode();
    codeExists = await this.findOne({ code });
    attemptsLeft -= 1;
  }

  if (codeExists) {
    throw new CustomError({
      msg: 'Failed to generate upload code. Try again later',
      code: 500
    });
  }

  return this.create({
    code,
    reviewTempId,
    userId,
    url,
  });
};

MobileCodesSchema.statics.verifyAndGetCode = async function(code) {
  const existingCode = await this.findOne({ code, isUsed: false });

  if (!existingCode) {
    throw new CustomError({
      message: 'Invalid upload code',
      code: 400
    });
  }

  return existingCode;
};

MobileCodesSchema.statics.verifyCodeByReviewId = async function(code, reviewTempId) {  
  const existingCode = await this.findOne({ code, reviewTempId, isUsed: false });

  if (!existingCode) {
    throw new CustomError({
      message: 'Invalid upload code',
      code: 400
    });
  }

  return existingCode;
};

MobileCodesSchema.statics.removeOldCodes = function() {
  const olderThan = moment()
    .subtract(1, 'days')
    .toDate();
  return this.deleteMany({ createdAt: { $lte: olderThan } });
};

const MobileCodesModel = mongoose.model('MobileCodes', MobileCodesSchema);

module.exports = MobileCodesModel;
