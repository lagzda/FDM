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
              });
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
function aggregate(parameters, callback){
    var match = {$match: {}},
        def = 'Total Records',
        sort = {$sort: {value: -1}},
        accummulator = { $sum: 1 },
        aggregation = [];
    for (var key in parameters) {
        parameters[key].mongo = '$'+parameters[key].category;
        if(parameters[key].match.length > 0){
            var values = parameters[key].match.map(function(i){
                return i.name;
            });
            match.$match[parameters[key].category] = { $in: values };
        } else {
            if (parameters[key].operation === 'Sort'){
                var direction = (parameters[key].direction === 'asc') ? 1 : -1;
                sort = {$sort: {value: direction}};
                aggregation.push(sort);
            }
            if (parameters[key].category && (def === 'Total Records' || parameters[key].operation === 'Group by')){
                def = parameters[key].mongo;  
            }
            if (parameters[key].operation === 'Get min'){
                accummulator = {$min: { $sum: 1 }};
            }
            if (parameters[key].operation === 'Get max'){
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
    
    
    Article.aggregate(aggregation, function (err, result) {
        Article.aggregate(aggregation, function (err, result) {
            callback(err, result);
        });
    }); 
}
function count(values){
    var page_count = 0;
    values.forEach(function(value){
        if (value.length > page_count){
            page_count = value.length;
        }  
    });
    return page_count;
}

function distinct(group, callback){
    Article.distinct(group, function(err, result){
        callback(err, result);
    });
}

function aggregate_recursive (n, parameters, results, callback) {
     if (n < Object.keys(parameters).length + 1) {
         aggregate(parameters['tab' + n].parameters, function(err,result) {
             if (err) {
                 
             } else {
                 results.push(result);
                 aggregate_recursive(n + 1, parameters, results, callback);
             }
         });        
     } else {
         callback(results); 
     }
}
function limit_results(result, page_size, page_no){
    var f_result = [];
    result.forEach(function(obj){
        var temp = obj.splice(page_size * page_no, page_size);
        f_result.push(temp);
    })
    return f_result;
}

/**
 * List of Articles
 */
exports.list = function (req, res) {
    var page_size = 10;
    if (req.query.group) {
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
        var page_no = req.query.page - 1;
        var j_parameters = JSON.parse(req.query.parameters);
        if (Object.keys(j_parameters).length !== 0){
            var results = [];
            aggregate_recursive(1, j_parameters, [], function(result){
                var page_count = Math.ceil(count(result)/page_size);
                var f_result = limit_results(result, page_size, page_no);
                console.log(f_result);
                var res_object = {
                    'results': f_result,
                    'page_count': page_count
                };
                res.json([res_object]);
            });   
        } else {
            aggregate({}, function(err, result){
                var res_object = {
                    'results': [result],
                    'page_count': 1
                };
                res.json([res_object]); 
            });
        }     
    }     
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
