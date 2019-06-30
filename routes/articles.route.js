const router = require("express").Router();
const articlesController = require("../controllers/articles.controller");
const { resizeAndSave } = require("../services/resize.js");

router.get("/", articlesController.getArticles);
router.get("/:id", articlesController.getArticle);
router.post("/", resizeAndSave, articlesController.addArticle);
router.put("/:id", resizeAndSave, articlesController.updateArticle);
router.delete("/:id", articlesController.deleteArticle);

module.exports = router;
