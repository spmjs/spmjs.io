var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Hook() {
  EventEmitter.call(this);
}

util.inherits(Hook, EventEmitter);

var hook = new Hook();

var dependent = require('./dependent');
var download = require('./download');
var Package = require('../models/package');
var account = require('../models/account');
var feed = require('./feed');
var elastical = require('elastical');
var client = new elastical.Client();

hook.on('create:project', function(project, publisher) {
  console.log('create', project.name);
  if (publisher) {
    account.save(publisher, {
      $inc: {
        count: 1
      }
    });
  }
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
    keywords : package.keywords,
    suggest: package.name
  }, { id: package.name });
});

hook.on('delete:project', function(project, unpublisher) {
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
  // substract count
  if (unpublisher) {
    account.save(unpublisher, {
      $inc: {
        count: -1
      }
    });
  }
});

hook.on('delete:package', function(package) {
  console.log('delete', package.name + '@' + package.version);
  dependent.calculate(package, 'delete');
});

hook.on('download:package', function(package) {
  console.log('download', package.name + '@' + package.version);
  download.save(package);
});

module.exports = hook;
