const router = require('express').Router();
const articlesController = require('../controllers/articles.controller');
const imageUploadMiddleware = require('../middlewares/imageUpload');
const cloudinaryUploadMiddleware = require('../middlewares/cloudinaryUploadMiddleware');

router.get('/', articlesController.getArticles);
router.get('/:id', articlesController.getArticle);
router.post('/', imageUploadMiddleware, cloudinaryUploadMiddleware, articlesController.addArticle);
router.put('/:id', imageUploadMiddleware, cloudinaryUploadMiddleware, articlesController.updateArticle);
router.delete('/:id', articlesController.deleteArticle);

module.exports = router;
