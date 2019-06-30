require('dotenv').config();

const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');
const bodyValidationMiddleware = require('../middlewares/body-validation');
const apiLimiter = require('../middlewares/rateLimiter');
const localTokenMiddleware = require('../middlewares/jwt-local.middleware').verifyToken;


router.post('/create', apiLimiter(), bodyValidationMiddleware.psw(), bodyValidationMiddleware.result, userCtrl.create);
router.post('/login', apiLimiter(), bodyValidationMiddleware.login(), bodyValidationMiddleware.result, userCtrl.authenticateUser);

router.get('/profile', localTokenMiddleware, userCtrl.userProfile);
router.get('/profile/:id', userCtrl.getOtherUserProfile);

router.post('/helpfulCount/:id', localTokenMiddleware, userCtrl.helpfulCountUpdate);
router.post('/looksgreatCount/:id', localTokenMiddleware, userCtrl.looksGreatCountUpdate);
//-------------------------------------------------

router.post('/forgotPsw', bodyValidationMiddleware.email(), bodyValidationMiddleware.result, userCtrl.forgotPsw);

router.get('/resetPsw', bodyValidationMiddleware.token(), bodyValidationMiddleware.result, userCtrl.linkToReset);

router.post('/resetPsw', bodyValidationMiddleware.resetPsw(), bodyValidationMiddleware.result, userCtrl.resetPsw);

router.get('/name', userCtrl.byUsername);
router.get('/:id', userCtrl.getOneUser);

module.exports = router;