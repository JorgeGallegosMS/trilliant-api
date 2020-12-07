require('dotenv').config();

const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');
const bodyValidationMiddleware = require('../middlewares/body-validation');
const apiLimiter = require('../middlewares/rateLimiter');
const localTokenMiddleware = require('../middlewares/jwt-local.middleware').verifyToken;

router.patch(
  '/add-social-links',
  apiLimiter(),
  localTokenMiddleware,
  bodyValidationMiddleware.addSocialLinks(),
  bodyValidationMiddleware.result,
  userCtrl.addSocialLinks
);

router.patch('/delete-social-links', apiLimiter(), localTokenMiddleware, userCtrl.deleteSocialLinks);
router.post('/create', apiLimiter(), bodyValidationMiddleware.psw(), bodyValidationMiddleware.result, userCtrl.create);
router.post(
  '/login',
  apiLimiter(),
  bodyValidationMiddleware.login(),
  bodyValidationMiddleware.result,
  userCtrl.authenticateUser
);

router.get('/profile', localTokenMiddleware, userCtrl.userProfile);
router.get('/profile/:id', userCtrl.getOtherUserProfile);

router.post('/generateUploadCode', localTokenMiddleware, userCtrl.generateUploadCode);
router.post('/verifyCode/:code', userCtrl.verifytUploadCode);

router.post('/forgotPsw', bodyValidationMiddleware.email(), bodyValidationMiddleware.result, userCtrl.forgotPsw);
router.get('/resetPsw', bodyValidationMiddleware.token(), bodyValidationMiddleware.result, userCtrl.linkToReset);
router.post('/resetPsw', bodyValidationMiddleware.resetPsw(), bodyValidationMiddleware.result, userCtrl.resetPsw);

router.get('/name', userCtrl.byUsername);
router.get('/:id', userCtrl.getOneUser);

router.put('/update_profile', localTokenMiddleware, userCtrl.updateProfile)

router.post('/upload_image', localTokenMiddleware, userCtrl.uploadProfilePicture)

// router.group(() => {
//     router.get('/me', 'UserController.me')
//     router.put('/update_profile', 'UserController.updateProfile')
// })
//     .prefix('account')
//     .middleware(['auth:jwt'])

module.exports = router;
