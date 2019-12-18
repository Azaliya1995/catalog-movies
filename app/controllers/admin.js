"use strict";

/**
 * Module dependencies.
 */

const mongoose = require("mongoose");
const { wrap: async } = require("co");
const Movie = mongoose.model("Movie");

exports.index = async (req, res) => {
  res.render("admin/index", {
    layout: "admin"
  });
};

exports.editMovieForm = async (req, res) => {
  const movie = await Movie.findOne({
    _id: req.params.id
  });
  res.render("admin/movie-form", {
    layout: "admin",
    movie: movie,
    title: "Edit movie",
    newFlag: false
  });
};

exports.editMovie = async (req, res) => {
  await Movie.updateOne(
    {
      _id: req.params.id
    },
    req.body
  );
  const movie = await Movie.findOne({
    _id: req.params.id
  });
  //movie.title = req.body.title;
  //movie.year = req.body.year;
  res.render("admin/movie-form", {
    layout: "admin",
    movie: movie,
    title: "Edit movie",
    newFlag: false,
    message: "Movie updated"
  });
};

exports.createMovieForm = async (req, res) => {
  res.render("admin/movie-form", {
    layout: "admin",
    movie: {},
    title: "Create movie",
    newFlag: true
  });
};

exports.movies = async(function*(req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 15;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  options.criteria = {
    year: {
      $gt: 2017
    }
  };

  options.sorting = {
    imdbRating: -1
  };
  const movies = yield Movie.list(options);
  const count = yield Movie.countDocuments();

  res.render("admin/movies", {
    title: "Movies",
    movies: movies,
    page: page + 1,
    pages: Math.ceil(count / limit),
    layout: "admin"
  });
});
