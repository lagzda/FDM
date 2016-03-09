'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  'Degree Classification': {
    type: String,
    default: '',
    trim: true
  },
    'Degree Subject': {
    type: String,
    default: '',
    trim: true
  },
    'End Date': {
    type: String,
    default: '',
    trim: true
  },
    'FDM Office': {
    type: String,
    default: '',
    trim: true
  },
    'Job Role': {
    type: String,
    default: '',
    trim: true
  },
    'Operating Location Name': {
    type: String,
    default: '',
    trim: true
  },
    'Placement Number': {
    type: String,
    default: '',
    trim: true
  },
    'Placement: Resource: Full Name': {
    type: String,
    default: '',
    trim: true
  },
    'Start Date': {
    type: String,
    default: '',
    trim: true
  },
    'Stream Trained': {
    type: String,
    default: '',
    trim: true
  },
    'University of Study': {
    type: String,
    default: '',
    trim: true
  }
  
});

mongoose.model('Article', ArticleSchema);
