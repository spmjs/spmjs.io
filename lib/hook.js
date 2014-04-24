var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Hook() {
  EventEmitter.call(this);
}

util.inherits(Hook, EventEmitter);

var hook = new Hook();

var dependent = require('./dependent');
var feed = require('./feed');

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
});

hook.on('delete:project', function(project) {
  console.log('delete', project.name);
});

hook.on('delete:package', function(package) {
  console.log('delete', package.name + '@' + package.version);
  dependent.calculate(package, 'delete');
});

module.exports = hook;
