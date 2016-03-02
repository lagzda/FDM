'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope','$state', '$stateParams', '$location', 'Authentication', 'Articles', 'Upload',
  function ($scope, $state, $stateParams, $location, Authentication, Articles, Upload) {
    $scope.authentication = Authentication;

    // Create new Article
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
            console.log(response);
            //$location.path('articles/' + response._id);
            $state.go('articles.list');
        }, function (errorResponse) {
            // ERROR CALLBACK - shown in the html view if error appears
            $scope.error = errorResponse.data.message;
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
      $scope.articles = Articles.query();
    };

    // Find existing Article
    $scope.findOne = function () {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
    };
  }
]);
