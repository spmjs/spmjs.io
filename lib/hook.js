var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Hook() {
  EventEmitter.call(this);
}

util.inherits(Hook, EventEmitter);

var hook = new Hook();

var dependent = require('./dependent');
var models = require('../models');
var Package = require('../models/package');
var elastical = require('elastical');
var client = new elastical.Client();
var cacheIndex = require('./cacheIndex');

hook.on('create:project', function(project, publisher) {
  console.log('create', project.name);
  if (publisher && publisher.id) {
    models.Account.update({
      count: models.sequelize.literal("count + 1")
    }, {
      where: {
        id: publisher.id
      }
    });
  }
});

hook.on('update:package', function(package) {
  console.log('update', package.name + '@' + package.version);
  dependent.calculate(package, 'update');
  models.History.create({
    name: package.name,
    version: package.version,
    publisher: package.publisher || {},
    time: Date.now(),
    action: 'publish'
  }).then(cacheIndex);

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
  if (unpublisher && unpublisher.id) {
    models.Account.update({
      count: models.sequelize.literal("count - 1")
    }, {
      where: {
        id: unpublisher.id
      }
    });
  }

  models.History.create({
    name: project.name,
    unpublisher: unpublisher,
    time: Date.now(),
    action: 'unpublish'
  });
});

hook.on('delete:package', function(package) {
  console.log('delete', package.name + '@' + package.version);
  dependent.calculate(package, 'delete');

  models.History.create({
    name: package.name,
    version: package.version,
    unpublisher: package.publisher || {},
    time: Date.now(),
    action: 'unpublish'
  });
});

hook.on('download:package', function(package) {
  console.log('download', package.name + '@' + package.version);
  models.Download.create({
    package: package.name + '@' + package.version,
    time: +Date.now()
  });
});

module.exports = hook;
