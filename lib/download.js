var Datastore = require('nedb');
var moment = require('moment');
var path = require('path');
var _ = require('lodash');

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

exports.stat = function(callback) {
  return download.find({}).sort({ time: -1 }).limit(50).exec(function(err, results) {
    var res = [];
    for (var i in results) {
      var item = results[i];
      if (item.time) {
        item.fromNow = moment(item.time).fromNow();
      }
      res.push(item);
    }
    res = _.uniq(res, function(item) {
      return item.package;
    }).slice(0, 10);

    download.count({time:{$gt:+moment().startOf('day')}}, function(err, todayCount) {
      callback && callback({
        recentlyPackages: res,
        todayCount: todayCount
      });
    });
  });
};
