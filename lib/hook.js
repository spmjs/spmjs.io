var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Hook() {
  EventEmitter.call(this);
}

util.inherits(Hook, EventEmitter);

var hook = new Hook();

var dependent = require('./dependent');
var Package = require('../models/package');
var account = require('../models/account');
var feed = require('./feed');
var elastical = require('elastical');
var client = new elastical.Client();

hook.on('create:project', function(project, publisher) {
  console.log('create', project.name);
  if (publisher) {
    account.get(publisher, function(user) {
      user.count = user.count || 0;
      user.count += 1;
      account.save(user.login, {
        $set: {
          count: user.count
        }
      });
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
    keywords : package.keywords
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
    account.get(unpublisher, function(user) {
      if (user.count && user.count > 0) {
        user.count -= 1;
      }
      console.log(user.count, 'count');
      account.save(user.login, {
        $set: {
          count: user.count
        }
      });
    });
  }
});

hook.on('delete:package', function(package) {
  console.log('delete', package.name + '@' + package.version);
  dependent.calculate(package, 'delete');
});

module.exports = hook;
