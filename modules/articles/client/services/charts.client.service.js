'use strict';

//Articles service
angular.module('articles').service('Charts', ['Articles',
	function(Articles) {
        var representation_params = [
            'Degree Subject',
            'Stream Trained',
            'Job Role',
            'Operating Location Name',
            'FDM Office',
            'Start Date',
            'End Date',
            'Degree Classification',
            'University of Study'
        ];
        var sorting_params = [
            "Alphabetical",
            "Numerical",
            "Date"
        ];
        var chart_types = [
            'Bar',
            'Line',
            'Doughnut',
            'Radar',
            'Pie',
            'PolarArea'
        ];
        var operations = [
            'Match',
            'Group by',
            'Sort',
            'Get average',
            'Get min',
            'Get max'
        ];
        
        this.get_operations = function (){
            return operations;
        }
        this.get_chart_types = function(){
            return chart_types;
        }
        
        this.get_representation_params = function(){
            return representation_params;
        };
        this.get_sorting_params = function(){
            return sorting_params;
        }
        
        this.get_chart_data = function () {
            var args_object = {},
                length = arguments.length,
                page = 1,
                callback = arguments[arguments.length - 1];
            
            if (typeof callback != 'function'){
                console.error("The last parameter needs to be a function");
            }
            if (length > 3){
                console.error("Not ok");
            }
            else if (length == 2){
                args_object = arguments[0];
            }
            else if(length == 3){
                args_object = arguments[0];
                page = arguments[1] || 1;
            }
            Articles.query({parameters: args_object, page: page}, function(result) {
                var page_count = result.pop();
                var labels = result.map(function(i){
                    if (i._id.length > 15){
                        return i._id.slice(0,15) + '...';
                    }
                    return i._id;
                });
                var values = result.map(function (i){
                    return i.value;   
                });
                var article = result;
                var chart_data = {
                    labels : labels,
                    data : [values],
                    series : ['Temporary'],
                    page_count : page_count
                };    
            callback(chart_data);
            });    
        };
        this.localSearch = function(group, callback){
            Articles.query({group: group}, function(result) {
                var result_dict = [];
                result.forEach(function(res){
                    if (typeof res == 'string'){
                        res = {name: res};
                        result_dict.push(res);
                    }
                });
                callback(result_dict);
            });
        }
	}
]);