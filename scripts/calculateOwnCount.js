// 重新计算所有用户的包数量
// ---
var async = require('async');

// load global config
var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
global.CONFIG = CONFIG;
var Project = require('../models/project');
var path = require('path');
var Datastore = require('nedb');
var account = new Datastore({
  filename: path.join(CONFIG.wwwroot, 'db', 'account.db'),
  autoload: true
});

var CountData = {};

Project.getAll().forEach(function(projectName) {
  var project = new Project({
    name: projectName
  });

  var tasks = [];

  project.owners.forEach(function(owner, i) {
    CountData[owner.id] = CountData[owner.id] || 0;
    CountData[owner.id] += 1;
  });
});


for (var id in CountData) {
  var count = CountData[id];
  console.log(id, 'count set to', count);
  account.update({id: id}, { $set: { count: count } }, function(err, numReplaced) {
    if (err) {
      console.log(err);
    }
  });
}
