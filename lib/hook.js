var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Hook() {
  EventEmitter.call(this);
}

util.inherits(Hook, EventEmitter);

var hook = new Hook();

hook.on('create', function(project) {
  console.log('create', project.name);
});

hook.on('update', function(package) {
  console.log('update', package.name, package.version);
});

module.exports = hook;
