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
function aggregate(parameters, page, callback){
    var parameters = JSON.parse(parameters),
        match = {$match: {}},
        def = 'Total Records',
        sort = {$sort: {value: -1}},
        accummulator = { $sum: 1 },
        page_size = 10,
        page = page - 1,
        aggregation = [];
    if (page < 0){
        page = 0;
    }
    for (var key in parameters) {
        parameters[key].mongo = "$"+parameters[key].category;
        if(parameters[key].match.length > 0){
            console.log(parameters[key]);
            var values = parameters[key].match.map(function(i){
                return i.name;
            });
            match.$match[parameters[key].category] = { $in: values };
        } else {
            if (parameters[key].operation == 'Sort'){
                var direction = (parameters[key].direction == "asc") ? 1 : -1;
                sort = {$sort: {value: direction}};
                aggregation.push(sort);
            }
            if (parameters[key].category && (def == 'Total Records' || parameters[key].operation == 'Group by')){
                def = parameters[key].mongo;  
            }
            if (parameters[key].operation == 'Get min'){
                accummulator = {$min: { $sum: 1 }};
            }
            if (parameters[key].operation == 'Get max'){
                accummulator = {$max: { $sum: 1 }};
            }
        }
    }
    
    aggregation.push(match);
    
    //Grouping stage
    var group = {
        $group: {
            _id: def,
            value: accummulator
        }
    };
    aggregation.push(group);
    aggregation.push(sort);
    
    
    console.log(aggregation);
    
    
    Article.aggregate(aggregation, function (err, result) {
        //First get the count of pages (aggregate without skip and limit)
        var page_count = Math.ceil(result.length / page_size);
        //Then aggregate with the sort and skip
        var skip = { $skip: page_size * page };
        aggregation.push(skip);
        var limit = { $limit: page_size };
        aggregation.push(limit);
        Article.aggregate(aggregation, function (err, result) {
            result.push(page_count);
            callback(err, result);
        });
    }); 
}

function distinct(group, callback){
    Article.distinct(group, function(err, result){
        callback(err, result);
    });
}
/**
 * List of Articles
 */
exports.list = function (req, res) {
    if (req.query.group){
        distinct(req.query.group, function(err, result){
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.json(result);  
        });
    }
    else {
        aggregate(req.query.parameters, req.query.page, function(err, result){
           if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.json(result);
       });    
    }
   
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
