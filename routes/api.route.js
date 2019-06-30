'use srtict';

const router =  require('express').Router();
const userRouter = require('./user.route');
const reviewsRouter = require('./reviews.route');
const clothesRouter = require('./clothes.route');
const articlesRouter = require('./articles.route');

router.use('/user', userRouter);
router.use('/reviews', reviewsRouter);
router.use('/clothes', clothesRouter);
router.use('/articles', articlesRouter);

module.exports = router;
