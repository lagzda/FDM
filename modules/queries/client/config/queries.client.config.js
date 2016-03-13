'use strict';

// Configuring the Articles module
angular.module('queries').run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Available queries',
      state: 'queries.list',
      roles: ['user']
    }); 
  }
]);
