'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports = function(sequelize, DataTypes) {

  var Download = sequelize.define('Download', {

    package: DataTypes.STRING,
    time: DataTypes.BIGINT
  }, {
    classMethods: {

      stat: function(callback) {
        this.findAll({
          order: 'time DESC',
          limit: 200
        }).then(function(results) {
          var res = [];
          for (var i in results) {
            var item = results[i];
            if (item.time) {
              item.fromNow = moment(item.time).fromNow();
            }
            res.push({
              fromNow: item.fromNow,
              package: item.package
            });
          }
          res = _.uniq(res, function(item) {
            return item.package;
          }).slice(0, 10);

          this.count({
            where: {
              time: {
                gt: +moment().startOf('day')
              }
            }
          }).then(function(todayCount) {
            callback({
              recentlyPackages: res,
              todayCount: todayCount
            });
          });

        }.bind(this));
      }
    }
  });

  return Download;

};

