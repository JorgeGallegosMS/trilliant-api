"use strict";

const mongoose = require("mongoose");

const ArticleSchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

ArticleSchema.virtual("id").get(function() {
  return this._id.toHexString();
});

ArticleSchema.set("toJSON", {
  virtuals: true
});

const ArticleModel = mongoose.model("Article", ArticleSchema);

module.exports = ArticleModel;
