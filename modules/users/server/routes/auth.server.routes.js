'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users password api
  app.route('/api/auth/forgot').post(users.forgot);
  app.route('/api/auth/reset/:token').get(users.validateResetToken);
  app.route('/api/auth/reset/:token').post(users.reset);

  // Setting up the users authentication api
  app.route('/api/auth/signout').get(users.signout);
   
  // Setting up the azure oauth routes    
  app.route('/api/auth/azure').get(users.oauthCall('azuread-openidconnect'));
  app.route('/api/auth/azure/callback').post(users.oauthCallback('azuread-openidconnect'));
};
