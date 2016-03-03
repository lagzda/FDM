'use strict';

/**
 * Module dependencies.
 */
var c;
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
    contentType = file.mimetype;

    
    // Validate the mimetype (SKIP FOR NOW)
    /*
    if (contentType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && contentType !== 'application/vnd.ms-excel'){
        return res.status(400).send('Unsupported file type.');
    }
    */
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
              return res.status(400).send('Data is not saved: ');
          } 
          else {
              var DataList = [];
              result.forEach(function(doc){
                  doc.title = req.body.title;
                  doc.url = destPath;
                  DataList.push(doc);
              })
              Article.collection.insert(DataList, {}, function(){
                  if (err){
                      return res.status(400).send('Data is not saved: ');
                  } else {  
                      res.status(200).send();
                  }
              });
          }
        });  
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
 * Queries
 */
function aggregate(controls, callback){
    var controls = JSON.parse(controls);
    var xparam = (controls.xparam) ? "$"+controls.xparam : "Total Records";
    var yparam = "$"+controls.yparam;
    var error = null;
    Article.aggregate([
        { $group: {
            _id: xparam,
            value: { $sum: 1 }
        }}
    ], function (err, result) {
        if (err) {
            error = err;
        }
        callback(err, result);
    }); 
}
/**
 * List of Articles
 */
exports.list = function (req, res) {
   aggregate(req.query.controls, function(err, result){
       if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        console.log(result);
        res.json(result);
   });
//  Article.find().sort('-created').exec(function (err, articles) {
//    if (err) {
//      return res.status(400).send({
//        message: errorHandler.getErrorMessage(err)
//      });
//    } else {
//      res.json(articles);
//      
//    }
//  });
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
