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
        console.log(req.body);
        var query = new Query;
        query.name = req.body.name;
        query.query = req.body.query;
        query.user = req.body.user;
        query.save(function (err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.status(200).send();
        }
      });
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
    Query.find(function(err, queries){
        console.log(queries);
        res.json(queries);
    })
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
