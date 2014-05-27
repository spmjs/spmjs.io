var Datastore = require('nedb');
var moment = require('moment');
var path = require('path');
var download = new Datastore({
  filename: path.join(CONFIG.wwwroot, 'db', 'download.db'),
  autoload: true
});

exports.save = function(package) {
  download.insert({
    package: package.name + '@' + package.version,
    time: Date.now()
  });
};

exports.todayCount = function(callback) {
  return download.find({}).sort({ time: -1 }).exec(function(err, results) {
    var res = [];
    var todayDownloads = [];
    for (var i in results) {
      var item = results[i];
      res.push(item);
      if (moment(item.time).isAfter(moment().startOf('day'))) {
        todayDownloads.push(item);
      }
    }
    callback && callback(todayDownloads.length);
  }); 
};
