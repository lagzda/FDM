'use strict';

//Queries service used for communicating with the queries REST endpoints
angular.module('queries').factory('Queries', ['$resource',
  function ($resource) {
    return $resource('api/queries/:queryId', {
      queryId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
