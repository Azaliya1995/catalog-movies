'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Movie = mongoose.model('Movie');
const assign = Object.assign;

exports.index = async(function*(req, res) {
    const page = (req.query.page > 0 ? req.query.page : 1) - 1;
    const _id = req.query.item;
    const limit = 15;
    const options = {
      limit: limit,
      page: page
    };
  
    if (_id) options.criteria = { _id };
  
    const movies = yield Movie.list(options);
    const count = yield Movie.countDocuments();
  
    res.render('movies/index', {
      title: 'Movies',
      movies: movies,
      page: page + 1,
      pages: Math.ceil(count / limit)
    });
  });