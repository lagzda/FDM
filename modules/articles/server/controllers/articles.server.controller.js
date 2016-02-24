'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  uuid = require('node-uuid'),
  fs = require('fs'),
  xlsxj = require('xlsx-to-json'),
  config = require(path.resolve('./config/config')),
  Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a article
 */
exports.create = function (req, res) {
  var file = req.files.file,
    tmpPath = file.name,
    extIndex = tmpPath.lastIndexOf('.'),
    extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex),
    fileName = uuid.v4() + extension,
    destPath = config.uploads.dataUpload.dest + fileName,
    contentType = file.mimetype,
    article = new Article(req.body);
    article.url = destPath;
    article.user = req.user;
    
    // Server side file type checker.
      if (contentType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && contentType !== 'application/vnd.ms-excel') {
        return res.status(400).send('Unsupported file type.');
      }
      fs.writeFile(destPath, file.data, function (err) {
        if (err) {
            return res.status(400).send('Data is not saved:');   
        }
        xlsxj({
          input: destPath, 
          output: null
        }, 
        function(err, result) {
          if(err) {
            console.error(err);
          } 
          else {
            res.json(result);   
          }
        });   
        /*article.save(function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json(article);
          }
        });*/   
    });	      
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
  var article = req.article;

  article.title = req.body.title;
  article.content = req.body.content;

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
  var article = req.article;

  article.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

/**
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  Article.findById(id).populate('user', 'displayName').exec(function (err, article) {
    if (err) {
      return next(err);
    } else if (!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.article = article;
    next();
  });
};
