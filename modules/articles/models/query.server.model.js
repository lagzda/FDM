'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var QuerySchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  'Query' : {
     
  },
  user: {
      type: Schema.ObjectId,
      ref: 'User'
  }
});

mongoose.model('Query', QuerySchema);
