const router = require('express').Router();

const reviewsCtrl = require('../controllers/reviews.controller');
const imageUploadMiddleware = require('../middlewares/imageUpload');
const localTokenMiddleware = require('../middlewares/jwt-local.middleware').verifyToken;

router.post('/upload-file', localTokenMiddleware, imageUploadMiddleware, reviewsCtrl.addTempReviewImage);
router.post('/add', localTokenMiddleware, reviewsCtrl.addReview);
router.put('/update/:id', localTokenMiddleware, reviewsCtrl.updateReview);
router.patch('/rate/:id', reviewsCtrl.rateAndCommentReview);
router.post('/url', reviewsCtrl.showUserReviews);
router.get('/image/:id', reviewsCtrl.getOneReviewImage);
router.get('/review/:id', reviewsCtrl.getParticularReview);
router.put('/review/:id', reviewsCtrl.rateAndCommentReview);
router.get('/all', reviewsCtrl.allReviews);

router.post('/helpfulCount/:id', localTokenMiddleware, reviewsCtrl.helpfulCountUpdate);
router.post('/looksgreatCount/:id', localTokenMiddleware, reviewsCtrl.looksGreatCountUpdate);

router.delete('/delete/:id', localTokenMiddleware, reviewsCtrl.deleteReview);

router.post('/helpful/:id', localTokenMiddleware, reviewsCtrl.helpfulUpdate);
router.post('/looksgreat/:id', localTokenMiddleware, reviewsCtrl.looksGreatUpdate);

module.exports = router;
