require('dotenv').config();

const router = require('express').Router();
const clothesController = require('../controllers/clothes.controller');
const bodyValidationMiddleware = require('../middlewares/body-validation');

router.post('/url', clothesController.clothReviews);

router.get('/ratings/:id', bodyValidationMiddleware.rating(), bodyValidationMiddleware.result, clothesController.getClothRatings);

module.exports = router;