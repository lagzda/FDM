'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope','$state', '$stateParams', '$location', 'Authentication', 'Articles', 'Upload', 'notifications', 'Charts', 'Controls',
  function ($scope, $state, $stateParams, $location, Authentication, Articles, Upload, notifications, Charts, Controls) {  
    $scope.authentication = Authentication;
    // AUTO COMPLETE STORE AND CACHE  
    $scope.auto = {};
    //PARAMETER CONTROL OPTIONS TO CHOOSE FROM [Available charts, Categories, Operations]
    $scope.controls = Charts.get_controls();
    //DEFAULT CHART  
    $scope.ch_sel = $scope.controls.chart_types[0];
    //PAGE NUMBER
    $scope.page_no = 1;
    //TAB LIST 
    $scope.tabs = {
        'tab1': Controls.generate_tab_frame()
    };
    //PARAMETER (OPERATION) LIST 
    $scope.parameters = {
        'param1': Controls.generate_parameter_frame() 
    };
    
    //ADD TAB
    $scope.add_tab = function(){
        Controls.add_tab($scope.tabs);
        $scope.selectedTab = Object.keys($scope.tabs).length - 1;

    };  
    //DELETE TAB
    $scope.remove_tab = function(event, ind){
        event.preventDefault();
        Controls.remove_tab($scope.tabs, ind + 1);
        $scope.selectedTab = Object.keys($scope.tabs).length - 1;
    };  
    //ADD PARAMETER
    $scope.add_parameter = function(){
        Controls.add_parameter(this.tab.parameters);
    };
    //DELETE PARAMETER
    $scope.remove_parameter = function(ind){
        Controls.remove_parameter(this.tab.parameters, ind);
    }; 
    //PAGINATION RELATED
    $scope.decr_page = function(page_no){
        if (page_no > 1){
            $scope.page_no -= 1;
            $scope.get_chart_data(true);
        }
    };
    $scope.inc_page = function(page_no){
        if (page_no < $scope.chart_data.page_count){
            $scope.page_no += 1;
            $scope.get_chart_data(true);
        }
    }; 
    //CHANGE PARAMETER OBJECT DEPENDING ON OPERATION  
    $scope.update_operation = function(ind, operation){
        Controls.update_operation(this.tab.parameters, ind, operation);
    };
    //GET AUTO COMPLETE DATA FOR MATCH AGAINST
    $scope.update_group_data = function(ind, sel){
        Charts.localSearch(sel, function(result){
            if (sel === 'Start Date' || sel === 'End Date'){
                result = result.map(function(myDate){
                    return {name: myDate.name.slice(0,10)};
                })
            }
            $scope.auto[sel] = result;
        });  
    };
    //FILTERING FUNCTION FOR AUTOCOMPLETE
    $scope.querySearch = function($query, auto) {
        return auto.filter(function(item){
            return item.name.toLowerCase().indexOf($query.toLowerCase()) !== -1;
        });
    };
      
    // Import data
    $scope.create = function (isValid) {
      // At the beginning there are no errors    
      $scope.error = null;
      // Check if the form is valid (meets the filetypes and required fields)    
      if (!isValid) {
        // Basically just throw error  
        $scope.$broadcast('show-errors-check-validity', 'articleForm');
        notifications.showError({message: 'There was an error uploading the file. Please try again!'});
        return false;
      }
      // If the form is valid perform the upload - send file and title to backend    
      Upload.upload({
            url: 'api/articles',
            data: {file: $scope.file 
                  }
        }).then(function (response) {
            // SUCCESS CALLBACK
            $state.go('home');
            notifications.showSuccess({message: 'The file has been successfully uploaded!'});
        }, function (errorResponse) {
            // ERROR CALLBACK - shown in the html view if error appears
            $scope.error = errorResponse.data.message;
            notifications.showError({message: 'There was an error uploading the file. Please try again!\n Error: '+ errorResponse.data});
      
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
      Charts.get_chart_data($scope.tabs, $scope.page_no, function(data){
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
