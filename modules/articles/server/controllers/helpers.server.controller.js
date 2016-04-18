var path = require('path'),
  mongoose = require('mongoose'),
  config = require(path.resolve('./config/config')),
  Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.aggregate_recursive = aggregate_recursive;
exports.aggregate = aggregate;
exports.distinct = distinct;
exports.count = count;
exports.limit_results = limit_results;

function count (values){
    var page_count = 0;
    values.forEach(function(value){
        if (value.length > page_count){
            page_count = value.length;
        }  
    });
    return page_count;
}

function distinct (group, callback){
    Article.distinct(group, function(err, result){
        callback(err, result);
    });
}
function aggregate_recursive(n, parameters, results, callback) {
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
//Function to set the limit of results for a single page size
 function limit_results (result, page_size, page_no){
    var f_result = [];
    result.forEach(function(obj){
        var temp = obj.splice(page_size * page_no, page_size);
        f_result.push(temp);
    })
    return f_result;
}

//The aggregation function that builds the whole query
function aggregate(parameters, callback){
    var match = {$match: {}},
        def = 'Total Records',
        sort = {$sort: {value: -1}},
        accummulator = { $sum: 1 },
        aggregation = [];
    var reserved = {
        '>' : '$gt',
        '<' : '$lt',
        '!=': '$ne'
    };
    for (var key in parameters) {
        parameters[key].mongo = '$'+parameters[key].category;
        if(parameters[key].match.length > 0){
            match.$match[parameters[key].category] = {};
            var values = parameters[key].match.map(function(i){
                if (parameters[key].category === 'Start Date' || parameters[key].category === 'End Date'){
                    console.log(new Date(i.name).toISOString());
                    return new Date(i.name).toISOString();
                } else {
                    return i.name;
                }
            });
            var final_values = [];
            for (var i = 0; i < values.length; i++){
                if (reserved[values[i]] !== undefined){
                    if (i + 1 < values.length){
                        if(reserved[values[i+1]] === undefined){
                            match.$match[parameters[key].category][reserved[values[i]]] = values[i+1];
                            i++;
                        } 
                    }
                } else {
                    final_values.push(values[i]);                         
                }
            }
            if (final_values.length !== 0){
                match.$match[parameters[key].category].$in = final_values;
                console.log(final_values);
            } 
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
    
    console.log(aggregation[0]);
    Article.aggregate(aggregation, function (err, result) {
        Article.aggregate(aggregation, function (err, result) {
            callback(err, result);
        });
    }); 
}