'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope','$state', '$stateParams', '$location', 'Authentication', 'Articles', 'Upload', 'notifications', 'Charts',
  function ($scope, $state, $stateParams, $location, Authentication, Articles, Upload, notifications, Charts) {
    $scope.authentication = Authentication;
    
    //PARAMETERS TO CHOOSE UPON
    $scope.representation_params = Charts.get_representation_params();
    $scope.sorting_params = Charts.get_sorting_params();
    //AVAILABLE CHARTS
    $scope.available_charts = Charts.get_chart_types();
    //AVAILABLE DATA OPERATIONS
    $scope.operations = Charts.get_operations();  
    //DEFAULT CHART  
    $scope.ch_sel = $scope.available_charts[0];
      
      
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
            notifications.showSuccess({message: 'Your task posted successfully'});
            $state.go('articles.list');
        }, function (errorResponse) {
            // ERROR CALLBACK - shown in the html view if error appears
            $scope.error = errorResponse.data.message;
            notifications.showError({message: $scope.error});
            $state.go('articles.list');
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
      Charts.get_chart_data($scope.controls, function(data){
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
