'use strict';

var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
global.CONFIG = CONFIG;

var models = require('../models/index');

models.sequelize.sync().then(function() {
  require('async').series([
    function(next) { return transform('Account', next) },
    function(next) { return transform('Download', next) },
    function(next) { return transform('History', next) }
  ], function() {
    console.log('done');
  });
});

function transform(type, done) {
  console.log('transform', type.toLowerCase());
  var join = require('path').join;
  var readFile = require('fs').readFileSync;
  var data = readFile(join(__dirname, '../data/db/'+type.toLowerCase()+'.db'), 'utf-8');

  data = data.split('\n').filter(function(item) {
    return item !== '';
  });

  require('async').eachSeries(data, function(item, callback) {
    item = JSON.parse(item);
    if (item.created_at) item.createdAt = item.created_at;
    if (item.updated_at) item.updatedAt = item.updated_at;
    if (item.publisher) {
      item.publisher_name = item.publisher.name;
      item.publisher_id = item.publisher.id;
    }
    models[type].create(item).then(function() {
      callback();
    });
  }, function() {
    done();
  });

}

