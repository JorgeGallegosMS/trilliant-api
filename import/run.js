const fs = require('fs');
const path = require('path');

const promiseLimit = require('promise-limit');
const nanoid = require('nanoid');
const parse = require('csv-parse/lib/sync');
const mongoose = require('mongoose');
const moment = require('moment');

const limit = promiseLimit(5);

const { UserModel } = require('../models/user.model');
const ClothModel = require('../models/cloth.model');
const { ReviewsModel } = require('../models/reviews.model');
const reviewsController = require('../controllers/reviews.controller');
const imageService = require('../services/image.service');
const db = require('../libs/db.lib');
const { REVIEW_IMAGE_LIMIT } = require('../constants');

const parseSocialMediaData = (type, data) => {
  if (!type || !data) {
    return {};
  }

  if (!data[`user${type}Handle`] || !data[`user${type}Link`]) {
    return {};
  }
  if (data[`user${type}Handle`] === 'none' || data[`user${type}Link`] === 'none') {
    return {};
  }

  return {
    [String(type).toLowerCase()]: {
      url: data[`user${type}Handle`],
      userName: data[`user${type}Link`]
    }
  };
};

const uploadReview = async (review, reviewImages, reviewUsers) => {
  if (!review) {
    console.log('Invalid review data');
    return;
  }

  const userData = reviewUsers.find(user => user.userID === review.userID);

  if (!userData) {
    console.log('User not found');
    return;
  }

  const user = await UserModel.findOneAndUpdate(
    { email: userData.userEmail.toLowerCase() },
    {
      email: userData.userEmail.toLowerCase(),
      firstName: userData.userFirstName,
      lastName: userData.userLastName,
      password: await UserModel.createHash(userData.userPassword),
      links: {
        ...parseSocialMediaData('Twitter', userData),
        ...parseSocialMediaData('Instagram', userData),
        ...parseSocialMediaData('Facebook', userData),
        ...parseSocialMediaData('Blog', userData)
      }
    },
    { upsert: true, new: true  }
  ).lean();

  if (!user) {
    console.error('Failed to create user');
    return;
  }

  const reviewExists = await ReviewsModel.findOne({
    url: review.itemURL,
    comment: review.comment
  });

  let clothReviewExists = false;

  if (reviewExists) {
    clothReviewExists = await ClothModel.findOne({
      url: review.itemURL,
      reviews: mongoose.Types.ObjectId(reviewExists._id)
    });
  }

  if (reviewExists && clothReviewExists) {
    console.log('Review already exists');
    return;
  }

  const currentReviewImages = reviewImages
    .filter(imageData => imageData.imageCode === review.imageCode)
    .filter(imageData => fs.existsSync(path.join(__dirname, 'images', imageData.imageName)))
    .filter(imageData => imageData.imageName.split('.').pop())

  if (currentReviewImages.length > REVIEW_IMAGE_LIMIT) {
    console.error(`Too many images for review with imageCode ${review.imageCode}. Max ${REVIEW_IMAGE_LIMIT} images allowed`);
    return;
  }

  const cloth = await ClothModel.findOneAndUpdate(
    {
      url: review.itemURL
    },
    {
      url: review.itemURL,
      store: review.storeName,
      name: review.productTitle,
      price: parseInt(review.priceInDollars, 10) || 0
    },
    { upsert: true, new: true }
  ).lean();

  if (!cloth) {
    console.error('[ERROR] failed to create cloth');
    return;
  }

  const reviewTempId = nanoid();
  await Promise.all(
    currentReviewImages.map(async imageData => {
      const filename = `${nanoid()}.${imageData.imageName.split('.').pop()}`;
      fs.copyFileSync(path.join(__dirname, 'images', imageData.imageName), path.join(__dirname, '../upload', filename));

      await imageService.saveTempImageData({
        isThumbnail: imageData.thumbnail === 'Yes',
        filename,
        reviewTempId,
      });
      return;
    })
  );

  let savedReview = null;
  let saveReviewErr = null;

  await reviewsController.addReview(
    {
      decodedToken: {
        _id: user._id
      },
      body: {
        reviewTempId,
        url: review.itemURL
      },
      headers: {
        url: review.itemURL
      }
    },
    {
      status: () => ({
        json: ({ data, msg }) => {
          if (data) {
            savedReview = data;
          } else {
            saveReviewErr = msg;
          }
        }
      })
    }
  );

  if (!savedReview || saveReviewErr) {
    console.error('Critical error saving the review', saveReviewErr);
    return;
  }

  let rateReviewErr = null;

  await reviewsController.rateAndCommentReview(
    {
      params: {
        id: savedReview._id
      },
      body: {
        overall: review.overallRating !== 'no rating' ? Math.round(review.overallRating * 20) : -1,
        quality: review.qualityRating !== 'no rating' ? Math.round(review.qualityRating * 20) : -1,
        fit: review.fitRating !== 'no rating' ? Math.round(review.fitRating * 20) : -1,
        shipping: review.shippingRating !== 'no rating' ? Math.round(review.shippingRating * 20) : -1,
        comment: review.comment,
        url: review.itemURL,
        imageUrls: savedReview.imageUrls,
      }
    },
    {
      status: () => ({
        json: ({ data, msg }) => {
          if (!data) {
            rateReviewErr = msg;
          }
        }
      })
    }
  );

  if (rateReviewErr) {
    console.error(rateReviewErr);
  }

  await ReviewsModel.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(savedReview._id)
    },
    {
      createdAt: (moment(review.reviewDate, 'M/DD/YYYY') || new Date()).toDate()
    }
  );

  console.log('Created review with id', savedReview._id, 'for cloth', cloth._id);

  return;
};

const main = async () => {
  try {
    const database = await db();

    const reviewsData = fs.readFileSync(path.join(__dirname, './reviews.csv'), 'utf-8');
    const reviewImagesData = fs.readFileSync(path.join(__dirname, './review_images.csv'), 'utf-8');
    const reviewUsersData = fs.readFileSync(path.join(__dirname, './review_users.csv'), 'utf-8');

    const reviews = parse(reviewsData, {
      columns: true,
      skip_empty_lines: true
    });

    const reviewImages = parse(reviewImagesData, {
      columns: true,
      skip_empty_lines: true
    });

    const reviewUsers = parse(reviewUsersData, {
      columns: true,
      skip_empty_lines: true
    });

    await Promise.all(
      reviews.map((review, idx) => {
        return limit(async () => {
          console.log(`Processing review ${idx + 1}/${reviews.length}`);
          const session = await database.startSession();
          await session.startTransaction();
          try {
            await uploadReview(review, reviewImages, reviewUsers);
            await session.commitTransaction();
          } catch (err) {
            console.error('[ERROR] transaction error', err);
            await session.abortTransaction();
          }
          return;
        });
      })
    );

    await database.connection.close();
    process.exit();
  } catch (err) {
    console.error('[ERROR] import parse error', err);
    await database.connection.close();
    process.exit(-1);
  }
};

main();
