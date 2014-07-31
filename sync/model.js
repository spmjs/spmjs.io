var path = require('path');
var Datastore = require('nedb');
var sync = new Datastore({
  filename: path.join(CONFIG.wwwroot, 'db', 'sync.db'),
  autoload: true
});

exports.add = function(data, callback) {
  sync.insert(data, function(err) {
    if (callback) callback(err);
  });
};

exports.last = function(callback) {
  sync
    .findOne({})
    .sort({ last_sync_time: -1 })
    .exec(callback);
};
