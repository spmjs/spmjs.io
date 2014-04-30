var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Hook() {
  EventEmitter.call(this);
}

util.inherits(Hook, EventEmitter);

var hook = new Hook();

var dependent = require('./dependent');
var Package = require('../models/package');
var feed = require('./feed');
var elastical = require('elastical');
var client = new elastical.Client();

hook.on('create:project', function(project) {
  console.log('create', project.name);
});

hook.on('update:package', function(package) {
  console.log('update', package.name + '@' + package.version);
  dependent.calculate(package, 'update');
  feed.add({
    name: package.name,
    version: package.version,
    publisher: package.publisher || '',
    time: Date.now()
  });

  // index the package
  client.index('spmjs', 'package', {
    name: package.name,
    description : package.description,
    keywords : package.keywords
  }, { id: package.name });
});

hook.on('delete:project', function(project) {
  console.log('delete', project.name);
  project.getVersions().forEach(function(version) {
    var package = new Package({
      name: project.name,
      version: version
    });
    dependent.calculate(package, 'delete');
  });
  // remove index
  client.delete('spmjs', 'package', project.name);
});

hook.on('delete:package', function(package) {
  console.log('delete', package.name + '@' + package.version);
  dependent.calculate(package, 'delete');
});

module.exports = hook;
