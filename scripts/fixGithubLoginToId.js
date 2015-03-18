// 把所有包的 owners 和 publisher 字段
// 替换为 { name: 'xx', id: 12 } 这样的对象
// 修复 https://github.com/spmjs/spmjs.io/issues/101
// ---
var async = require('async');

// load global config
var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
global.CONFIG = CONFIG;

var account = require('../models/account');
var Project = require('../models/project');
var Package = require('../models/package');

Project.getAll().forEach(function(projectName) {
  console.log('Start fixing ' + projectName);
  var project = new Project({
    name: projectName
  });

  var tasks = [];
  project.owners.forEach(function(ownerName, i) {
    if (ownerName && typeof ownerName === 'string') {
      tasks.push(function(callback) {
        getObjByName(ownerName, function(obj) {
          console.log('  project owner field fix to ' + JSON.stringify(obj));
          project.owners[i] = obj;
          callback(null, obj);
        });
      });
    }
  });
  project.getVersions().forEach(function(version) {
    var publisher = project.packages[version].publisher;
    if (publisher && typeof publisher === 'string') {
      tasks.push(function(callback) {
        getObjByName(publisher, function(obj) {
          console.log('  project publisher field fix to ' + JSON.stringify(obj));
          project.packages[version].publisher = obj;
          callback(null, obj);
        });
      });
    }
  });
  async.parallel(tasks, function(err, results) {
    project.save();
  });

  project.getVersions().forEach(function(version) {
    var package = new Package({
      name: projectName,
      version: version
    });
    if (package.publisher && typeof package.publisher === 'string') {
      getObjByName(package.publisher, function(obj) {
        console.log('  package publisher field fix to ' + JSON.stringify(obj));
        package.publisher = obj;
        package.save();
      });
    }
  });
});

function getObjByName(name, callback) {
  account.getByName(name, function(user) {
    if (user) {
      callback({
        name: user.login,
        id: user.id.toString()
      });
    }
  });
}
