'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope','$state', '$stateParams', '$location', 'Authentication', 'Articles', 'Upload', 'notifications', 'Charts', 'Controls',
  function ($scope, $state, $stateParams, $location, Authentication, Articles, Upload, notifications, Charts, Controls) {
    $scope.authentication = Authentication;
    
    //PARAMETER CONTROL OPTIONS TO CHOOSE FROM [Available charts, Categories, Operations]
    $scope.controls = Charts.get_controls();
    //DEFAULT CHART  
    $scope.ch_sel = $scope.controls.chart_types[0];
    //PAGE NUMBER
    $scope.page_no = 1;
    //PARAMETER (OPERATION) LIST 
    $scope.parameters = {
        'param1': Controls.generate_parameter_frame() 
    };
    //ADD PARAMETER
    $scope.add_parameter = function(){
        Controls.add_parameter($scope.parameters);
    }
    //DELETE PARAMETER
    $scope.remove_parameter = function(ind){
        Controls.remove_parameter($scope.parameters, ind);
    }
    //TABS
    // Tab counter
    var counter = 1;
    // Array to store the tabs
    $scope.tabs = [];
    // Add tab to the end of the array
    var addTab = function () {
      $scope.tabs.push({ title: 'Tab ' + counter, content: 'Tab ' + counter });
      counter++;
      $scope.tabs[$scope.tabs.length - 1].active = true;
    };

    // Remove tab by index
    var removeTab = function (event, index) {
      event.preventDefault();
      event.stopPropagation();
      $scope.tabs.splice(index, 1);
    };
    // Initialize the scope functions
    $scope.addTab    = addTab;
    $scope.removeTab = removeTab;
     
      
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
    //CHANGE PARAMETER OBJECT DEPENDING ON OPERATION  
    $scope.update_operation = function(ind, operation){
        Controls.update_operation($scope.parameters, ind, operation);
    }
    //GET AUTO COMPLETE DATA FOR MATCH AGAINST
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
