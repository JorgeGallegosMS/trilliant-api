const multer = require('multer');
const router = require('express').Router();

const reviewsCtrl = require('../controllers/reviews.controller');
const imageUploadMiddleware = require('../middlewares/imageUpload');
const verifyUploadToken = require('../middlewares/verifyUploadToken');
const localTokenMiddleware = require('../middlewares/jwt-local.middleware').verifyToken;
const bodyValidationMiddleware = require('../middlewares/body-validation');

router.post('/upload-file-mobile', verifyUploadToken, imageUploadMiddleware, reviewsCtrl.addTempReviewImage);
router.delete('/upload-file-mobile', verifyUploadToken, reviewsCtrl.removeTempReviewImage);
router.post('/upload-file', localTokenMiddleware, imageUploadMiddleware, reviewsCtrl.addTempReviewImage);
router.delete('/upload-file', localTokenMiddleware, reviewsCtrl.removeTempReviewImage);
router.post('/add', bodyValidationMiddleware.addReview, localTokenMiddleware, reviewsCtrl.addReview);
router.post('/addMobile', bodyValidationMiddleware.addReview, verifyUploadToken, reviewsCtrl.addReviewMobile);
router.put('/update/:id', localTokenMiddleware, reviewsCtrl.updateReview);
router.patch('/rate/:id', localTokenMiddleware, reviewsCtrl.rateAndCommentReview);
router.post('/url', reviewsCtrl.showUserReviews);
router.get('/image/:id', reviewsCtrl.getOneReviewImage);
router.get('/review/getByTempId/:id', reviewsCtrl.getReviewByTempId);
router.get('/review/:id', reviewsCtrl.getParticularReview);
router.put('/review/:id', localTokenMiddleware, reviewsCtrl.rateAndCommentReview);
router.get('/all', reviewsCtrl.allReviews);

router.delete('/delete/:id', localTokenMiddleware, reviewsCtrl.deleteReview);

router.post('/helpful/:id', localTokenMiddleware, reviewsCtrl.helpfulUpdate);
router.post('/looksgreat/:id', localTokenMiddleware, reviewsCtrl.looksGreatUpdate);

module.exports = router;
