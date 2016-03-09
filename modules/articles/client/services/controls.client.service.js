'use strict';

//Articles service
angular.module('articles').service('Controls', ['Articles',
	function(Articles) {
        
        this.generate_parameter_frame = function(){
            return {
                operation: '',
                category: '',
                match: '',
                direction: '',
                auto: ''      
            }
        }
        
        this.add_parameter = function(parameters){
            var index = Object.keys(parameters).length;
            parameters['param'+(index+1)] = this.generate_parameter_frame();
        }
        this.remove_parameter = function(parameters, ind){
            delete parameters['param'+(ind)];
            for (var i = ind; i < Object.keys(parameters).length + 1; i++){
                parameters['param'+(ind)] = parameters['param'+(ind+1)];
                delete parameters['param'+(ind+1)];
            }
        }
        this.update_operation = function(parameters, ind, operation){
            if (operation != 'Match') {
                if (operation != 'Sort'){
                    parameters['param'+ind].direction = '';
                }
                parameters['param'+ind].match = '';
            }
        }
    }
]);