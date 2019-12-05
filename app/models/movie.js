"use strict";

/**
 * Module dependencies.
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: { type: String, default: "", trim: true, maxlength: 400 },
  year: {type: Number},
  cast: {type: [{ type: String }]},
  genres: {type: [{ type: String }]},
  img: {type: String},
  imdbRating: {type: String},
  description: {type: String},
  runtime: {type: String},
  imdbID: {type: String},
  version: {type: Number, default: 1}
});

MovieSchema.statics = {
  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list: function(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model("Movie", MovieSchema);