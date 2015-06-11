'use strict';

require('gnode');

var log = require('spm-log');

var logInfo = log.info;
var logWarn = log.warn;
var logError = log.error;

var format = require('util').format;

log.info = function(cat) {
  var message = '';
  if (arguments[1]) {
    message = format.apply(require('util'), [arguments[1]].concat(Array.prototype.slice.call(arguments, 2)));
  }
  process.send('[info] ['+cat+'] ' + message);
  //logInfo.apply(log, arguments);
};
log.error = function(cat) {
  var message = '';
  if (arguments[1]) {
    message = format.apply(require('util'), [arguments[1]].concat(Array.prototype.slice.call(arguments, 2)));
  }
  process.send('[erro] ['+cat+'] ' + message);
  //logError.apply(log, arguments);
};
log.warn = function(cat) {
  var message = '';
  if (arguments[1]) {
    message = format.apply(require('util'), [arguments[1]].concat(Array.prototype.slice.call(arguments, 2)));
  }
  process.send('[warn] ['+cat+'] ' + message);
  //logWarn.apply(log, arguments);
};

var consoleLog = console.log;
console.log = function() {
  process.send(arguments[0] || '');
  //consoleLog.apply(console, arguments);
};

process.on('message', function(m) {
  m = m.split('^');
  require('./_index')(m[0], {
    name: m[1],
    id: m[2]
  }, function(err) {
    setTimeout(function() {
      process.send('end');
      process.exit(0);
    }, 1000);
  });

});
