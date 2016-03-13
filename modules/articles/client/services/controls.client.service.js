'use strict';

//Articles service
angular.module('articles').service('Controls', ['Articles',
	function(Articles) {
        
        this.generate_tab_frame = function(){
            return {
                parameters: {
                    'param1' : this.generate_parameter_frame()
                }
            };
        };
        
        this.generate_parameter_frame = function(){
            return {
                operation: '',
                category: '',
                match: '',
                direction: '',      
            };
        };
        
        this.add_tab = function(tabs){
            var index = Object.keys(tabs).length;
            tabs['tab'+(index+1)] = this.generate_tab_frame();
        };
        this.remove_tab = function(tabs, ind){
            delete tabs['tab'+(ind)];
            for (var i = ind; i < Object.keys(tabs).length + 1; i++){
                tabs['tab'+(i)] = tabs['tab'+(i+1)];
                delete tabs['tab'+(i+1)];
            }
        };
        
        this.add_parameter = function(parameters){
            var index = Object.keys(parameters).length;
            parameters['param'+(index+1)] = this.generate_parameter_frame();
        };
        this.remove_parameter = function(parameters, ind){
            delete parameters['param'+(ind)];
            for (var i = ind; i < Object.keys(parameters).length + 1; i++){
                parameters['param'+(i)] = parameters['param'+(i+1)];
                delete parameters['param'+(i+1)];
            }
        };
        this.update_operation = function(parameters, ind, operation){
            if (operation !== 'Match') {
                if (operation !== 'Sort'){
                    parameters['param'+ind].direction = '';
                }
                parameters['param'+ind].match = '';
            }
        };
    }
]);