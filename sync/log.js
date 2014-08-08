var moment = require('moment');

module.exports = function(msg) {
  msg = '['+moment().format('YYYY-MM-DD HH:mm:SS')+'] [sync] ' + msg;
  var args = [msg].concat(Array.prototype.slice.call(arguments, 1));
  console.log.apply(console, args);
};
