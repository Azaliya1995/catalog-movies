'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Movie = mongoose.model('Movie');
const assign = Object.assign;
const fs = require("fs");

// exports.load = async(function*(req, res, next, id) {
//   try {
//     req.movie = yield Movie.load(id);
//     if (!req.movie) return next(new Error('Movie not found'));
//   } catch (err) {
//     return next(err);
//   }
//   next();
// });

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

exports.view = async function(req, res) {  //add page for one movie
  console.log('view');
  const movie = req.movie;
  res.render('movies/view', {
    id: req.params.id,
    movie: movie
  });
};
 
exports.import = async function (req, res) {
  const movies = JSON.parse(
    fs.readFileSync(`${__dirname}/data/movies.json`, "utf-8")
  );
  try {
    await Movie.create(movies);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  res.send("Ok");
}