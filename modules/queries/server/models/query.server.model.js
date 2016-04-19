'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Query Schema
 */
var QuerySchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
      type: String,
      default: 'Custom query'
  },  
  query : {
     
  },
  user: {
      type: Schema.ObjectId,
      ref: 'User'
  }
});

mongoose.model('Query', QuerySchema);
