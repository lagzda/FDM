'use strict';

//Articles service
angular.module('articles').service('Charts', ['Articles',
	function(Articles) {
        var representation_params = [
            'Degree Subject',
            'Stream Trained',
            'Job Role',
            'Placement Number',
            'Placement: Resource: Full Name',
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
            'Counting',
            'Average',
            'Comparisons',
            'Time'
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
        
        
        function parse_arguments(){
            var args_object = {};
            for (var i = 0; i < arguments.length-1; i++) {
                var split = String(arguments[i]).split("=");
                args_object[split[0]] = split[1]; 
            }
            return args_object;
        };
        
        
        this.get_chart_data = function () {
            var args_object = {},
                length = arguments.length,
                callback = arguments[arguments.length - 1];
            
            if (typeof callback != 'function'){
                console.error("The last parameter needs to be a function");
            }
            if (length > 2){
                console.error("Not ok");
            }
            else if (length == 2){
                args_object = arguments[0];
            }    
            Articles.query({controls: args_object}, function(result) {
                var labels = result.map(function(i){
                    return i._id;
                });
                var values = result.map(function (i){
                    return i.value;   
                });
                var article = result;
                var chart_data = {
                    labels : labels,
                    data : [values],
                    series : ['Series A', 'Series B']
                };    
            callback(chart_data);
            });    
        };
	}
]);