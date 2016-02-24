'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Visualise Data',
      state: 'articles.list',
      roles: ['user']
    });
    Menus.addMenuItem('topbar', {
      title: 'Import Data',
      state: 'articles.create',
      roles: ['user']
    });  
  }
]);
