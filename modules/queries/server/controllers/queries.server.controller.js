'use strict';

/**
 * Module dependencies.
 */
var c;
var path = require('path'),
  mongoose = require('mongoose'),
  Query = mongoose.model('Query'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a query
 */
exports.create = function (req, res) {
    //TODO   
};

/**
 * Show the current query
 */
exports.read = function (req, res) {
  res.json(req.query);
};

/**
 * Update a query
 */
exports.update = function (req, res) {
  var query = req.query;

  query.title = req.body.title;
  query.content = req.body.content;

  query.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(query);
    }
  });
};

/**
 * Delete a query
 */
exports.delete = function (req, res) {
  var query = req.query;

  query.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(query);
    }
  });
};

/**
 * List of Queries
 */
exports.list = function (req, res) {
    //TODO
};

/**
 * Query middleware
 */
exports.queryByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Query is invalid'
    });
  }

  Query.findById(id).populate('user', 'displayName').exec(function (err, query) {
    if (err) {
      return next(err);
    } else if (!query) {
      return res.status(404).send({
        message: 'No query with that identifier has been found'
      });
    }
    req.query = query;
    next();
  });
};
