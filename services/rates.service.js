const Reviews = require('../models/reviews.model').ReviewsModel;
const User = require('../models/user.model').UserModel;
const Cloth = require('../models/cloth.model');
const CustomError = require('../libs/custom-error.lib');

const RATE_TYPES = {
  helpful: 'helpful',
  looksGreat: 'looksGreat'
};

module.exports.updateRate = async (action, rateType, userId, reviewId) => {
  const rateField = RATE_TYPES[rateType];
  const rateCountField = `${rateField}Count`;

  if (!rateField) {
    throw new CustomError({
      message: `Incorrect rate type. Should be one of [${Object.keys(RATE_TYPES)}]`,
      code: 400
    });
  }

  try {
    const review = await Reviews.findById(reviewId);
    const userAlreadyRated = review[rateField].includes(userId);

    if (
      (action === 'add' && userAlreadyRated) ||
      (action === 'remove' && !userAlreadyRated) ||
      review.userId === userId
    ) {
      return review[rateCountField];
    }

    const cloth = await Cloth.findOne({ url: review.url });
    const user = await User.findById(review.userId);

    if (!cloth || !user) {
      throw new CustomError({
        message: 'Can\'t find related cloth/user',
        code: 500
      });
    }

    if (action === 'add') {
      review[rateField] = [...review.helpful, userId];
      review[rateCountField] += 1;
      cloth[rateCountField] += 1;
      user[rateCountField] += 1;
      await review.save();
      await cloth.save();
      await user.save();

      return review[rateCountField];
    } else if (action === 'remove') {
      review[rateField] = review[rateField].filter(uid => uid !== userId);
      review[rateCountField] -= 1;
      cloth[rateCountField] -= 1;
      user[rateCountField] -= 1;
      await review.save();
      await cloth.save();
      await user.save();

      return review[rateCountField];
    } else {
      return review[rateCountField];
    }
  } catch (err) {
    throw new CustomError({
      message: err.message,
      code: err.code
    });
  }
};
