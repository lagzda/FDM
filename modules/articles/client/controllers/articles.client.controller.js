'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope','$state', '$stateParams', '$location', 'Authentication', 'Articles', 'Upload', 'notifications', 'Charts',
  function ($scope, $state, $stateParams, $location, Authentication, Articles, Upload, notifications, Charts) {
    $scope.authentication = Authentication;
    //PARAMETER LIST
    $scope.parameters = {
        'param1': {operation: '',
                   category: '',
                   match: '',
                   direction: '',
                   auto: ''
                  }   
    };
    //ADD PARAMETER
    $scope.add_parameter = function(){
        var index = Object.keys($scope.parameters).length;
        $scope.parameters['param'+(index+1)] = {operation: '',
                                                category: '',
                                                match: '',
                                                direction: '',
                                                auto: []
                                                };
    }
    //DELETE PARAMETER
    $scope.remove_parameter = function(ind){
        delete $scope.parameters['param'+(ind)];
        for (var i = ind; i < Object.keys($scope.parameters).length + 1; i++){
            $scope.parameters['param'+(ind)] = $scope.parameters['param'+(ind+1)];
            delete $scope.parameters['param'+(ind+1)];
        }
    }
    
    //TABS
    $scope.tabs = [
        { title:'1', content:'Dynamic content 1' },
        { title:'2', content:'Dynamic content 2', disabled: true }
    ];
      
    //PARAMETERS TO CHOOSE FROM
    $scope.representation_params = Charts.get_representation_params();
    $scope.sorting_params = Charts.get_sorting_params();
    //AVAILABLE CHARTS
    $scope.available_charts = Charts.get_chart_types();
    //AVAILABLE DATA OPERATIONS
    $scope.operations = Charts.get_operations();  
    //DEFAULT CHART  
    $scope.ch_sel = $scope.available_charts[0];
    //PAGE NUMBER
    $scope.page_no = 1;  
    
    //PAGINATION RELATED
    $scope.decr_page = function(page_no){
        if (page_no > 1){
            $scope.page_no -= 1;
            $scope.get_chart_data(true);
        }
    }
    $scope.inc_page = function(page_no){
        if (page_no < $scope.chart_data.page_count){
            $scope.page_no += 1;
            $scope.get_chart_data(true);
        }
    } 
      
    $scope.update_operation = function(ind, operation){
        if (operation != 'Match') {
            if (operation != 'Sort'){
                $scope.parameters['param'+ind].direction = '';
            }
            $scope.parameters['param'+ind].match = '';
        }
    }
    //LOCAL SEARCH
    $scope.update_group_data = function(ind, sel){
        Charts.localSearch(sel, function(result){
            $scope.parameters['param'+ind].auto = result;
        });  
    };
    
    //FILTERING FUNCTION FOR AUTOCOMPLETE
    $scope.querySearch = function($query, auto) {
        return auto.filter(function(item){
            return item.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
        });
        //return $query ? auto.filter( createFilterFor($query) ) : auto; 
    }
    function createFilterFor(query) {
      return function filterFn(data) {
        return (data.name.indexOf(query) === 0);
      };
    }
    // Import data
    $scope.create = function (isValid) {
      // At the beginning there are no errors    
      $scope.error = null;
      // Check if the form is valid (meets the filetypes and required fields)    
      if (!isValid) {
        // Basically just throw error  
        $scope.$broadcast('show-errors-check-validity', 'articleForm');
        return false;
      }
      // If the form is valid perform the upload - send file and title to backend    
      Upload.upload({
            url: 'api/articles',
            data: {file: $scope.file, 
                   title: this.title 
                  }
        }).then(function (response) {
            // SUCCESS CALLBACK
            $state.go('articles.list');
            notifications.showSuccess({message: 'The file has been successfully uploaded!'});
        }, function (errorResponse) {
            // ERROR CALLBACK - shown in the html view if error appears
    
            $scope.error = errorResponse.data.message;
            notifications.showError({message: 'There was an error uploading the file. Please try again!'});
      
        });    
    };

    // Remove existing Article
    $scope.remove = function (article) {
      if (article) {
        article.$remove();

        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function () {
          $location.path('articles');
        });
      }
    };

    // Update existing Article
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      var article = $scope.article;

      article.$update(function () {
        $location.path('articles/' + article._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    
    // Find a list of Articles
    $scope.find = function () {
      Charts.get_chart_data(function(data){
          $scope.chart_data = data;
      }); 
    };
    //Get data for the chart  
    $scope.get_chart_data = function (isValid) {
      // At the beginning there are no errors    
      $scope.error = null;
      // Check if the form is valid   
      if (!isValid) {
        // Basically just throw error  
        $scope.$broadcast('show-errors-check-validity', 'chartForm');
        return false;
      }   
      Charts.get_chart_data($scope.parameters, $scope.page_no, function(data){
          $scope.chart_data = data;
      });
    };
    // Find existing Article
    $scope.findOne = function () {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
    };
  }
]);
