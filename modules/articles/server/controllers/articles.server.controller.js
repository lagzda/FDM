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
    // Get the file from request
    var file = req.files.file,
    // Get temporary path of the file   
    tmpPath = file.name,
    // Find the last occurence of the dot (needed for extension)    
    extIndex = tmpPath.lastIndexOf('.'),
    // Extract the extension    
    extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex),
    // Generate a random file name    
    fileName = uuid.v4() + extension,
    // Specify path to save the excel file    
    destPath = config.uploads.dataUpload.dest + fileName,
    // Extract mimetype for validation purposes    
    contentType = file.mimetype,
    // Create a new Article instance    
    article = new Article(req.body);
    // Add a field url to point to file (maybe won't need it in future)
    article.url = destPath;
    // Add the field of user who imported the data
    article.user = req.user;
    
    // Validate the mimetype
    if (contentType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && contentType !== 'application/vnd.ms-excel'){
        return res.status(400).send('Unsupported file type.');
    }
    // If mimetype valid write to file system
    fs.writeFile(destPath, file.data, function (err) {
        if (err) {
            return res.status(400).send('Data is not saved:');   
        }
        // When file is written parse the file into json
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
        // COMMENTED OUT FOR NOW FOR TESTING...
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
