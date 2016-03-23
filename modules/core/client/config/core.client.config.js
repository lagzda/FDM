'use strict';

// Configuring the Articles module
angular.module('core').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Help',
      state: 'help',
      roles: ['user']
    });  
  }
]);