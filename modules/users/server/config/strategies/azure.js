'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  OIDCStrategy = require('passport-azure-ad').OIDCStrategy,
  users = require('../../controllers/users.server.controller');

module.exports = function (config) {
  // Use azure-ad strategy
  passport.use(new OIDCStrategy({
    callbackURL: config.azure.callbackURL,
    clientID: 'a635e7d4-ee39-4e18-a27f-d22a6b253525',
    identityMetadata: 'https://login.microsoftonline.com/c14c8900-0880-44c5-ba70-a07a1faad121/.well-known/openid-configuration',
    clientSecret: 'y2iiSdt4YZ3un6/946Wyvc0adwoP5OMAR8lhgiDjOwA=', // if you are doing code or id_token code
 	skipUserProfile: true, // for AzureAD should be set to true.
 	responseType: 'id_token code', // for login only flows use id_token. For accessing resources use `id_token code`
 	responseMode: 'form_post', // For login only flows we should have token passed back to us in a POST
 	//scope: ['email', 'profile'], // additional scopes you may wish to pass
 	validateIssuer: true, // if you have validation on, you cannot have users from multiple tenants sign in
 	passReqToCallback: false
  },
  function(iss, sub, profile, accessToken, refreshToken, req, done) {
    if (!profile.email) {
      return done(new Error("No email found"), null);
    }
    // Set the provider data and include tokens
    var providerData = profile._json;
    providerData.accessToken = accessToken;
    providerData.refreshToken = refreshToken;
    // Create the user OAuth profile
    var providerUserProfile = {
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      displayName: profile.displayName,
      email: providerData.email ? providerData.email : undefined,
      username: providerData.email ? providerData.email.split('@')[0] : 'undefined',
      provider: 'azuread-openidconnect',
      providerIdentifierField: 'id',
      providerData: providerData
    };
      console.log(providerUserProfile);

    // Save the user OAuth profile
    users.saveOAuthUserProfile(req, providerUserProfile, done);
     
  })); 
};
