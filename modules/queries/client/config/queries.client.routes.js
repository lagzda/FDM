'use strict';

// Setting up route
angular.module('queries').config(['$stateProvider',
  function ($stateProvider) {
    // Queries state routing
    $stateProvider
      .state('queries', {
        abstract: true,
        url: '/queries',
        template: '<ui-view/>'
      })
      .state('queries.list', {
        url: '',
        templateUrl: 'modules/queries/client/views/list-queries.client.view.html'
      })
      .state('queries.view', {
        url: '/:queryId',
        templateUrl: 'modules/queries/client/views/view-query.client.view.html'
      })
      .state('queries.edit', {
        url: '/:queryId/edit',
        templateUrl: 'modules/queries/client/views/edit-query.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
