'use strict';

/**
 * Module dependencies.
 */
var queriesPolicy = require('../policies/queries.server.policy'),
  queries = require('../controllers/queries.server.controller');

module.exports = function (app) {
  // Queries collection routes
  app.route('/api/queries').all(queriesPolicy.isAllowed)
    .get(queries.list)
    .post(queries.create);

  // Single query routes
  app.route('/api/queries/:queryId').all(queriesPolicy.isAllowed)
    .get(queries.read)
    .put(queries.update)
    .delete(queries.delete);

  // Finish by binding the query middleware
  app.param('queryId', queries.queryByID);
};
