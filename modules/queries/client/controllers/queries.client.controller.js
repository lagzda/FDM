'use strict';

// Queries controller
angular.module('queries').controller('QueriesController', ['$scope','$state', '$stateParams', '$location', '$mdBottomSheet', 'Authentication', 'Queries', 
  function ($scope, $state, $stateParams, $location, $mdBottomSheet, Authentication, Queries) {
    $scope.authentication = Authentication;
      
      
    // Import data
    $scope.create = function (isValid) {
        //TODO
    };

    // Remove existing Query
    $scope.remove = function (query) {
      if (query) {
        query.$remove();

        for (var i in $scope.queries) {
          if ($scope.queries[i] === query) {
            $scope.queries.splice(i, 1);
          }
        }
      } else {
        $scope.query.$remove(function () {
          $location.path('queries');
        });
      }
    };

    // Update existing Query
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'queryForm');
        return false;
      }

      var query = $scope.query;

      query.$update(function () {
        $location.path('queries/' + query._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    
    // Find a list of Queries
    $scope.find = function () {
      $scope.queries = Queries.query();
        console.log($scope.queries);
    };

    // Find existing Query
    $scope.findOne = function () {
      $scope.query = Queries.get({
        queryId: $stateParams.queryId
      });
    };
    $scope.listItemClick = function(query) {
        var clickedItem = query;
        $mdBottomSheet.hide(query);
    };  
  }
]);
