'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports = function(sequelize, DataTypes) {

  var History = sequelize.define('History', {

    name: DataTypes.STRING,
    version: DataTypes.STRING,
    publisher_name: DataTypes.STRING,
    publisher_id: DataTypes.INTEGER,
    time: DataTypes.BIGINT,
    action: DataTypes.STRING
  }, {

    classMethods: {

      stat: function(callback) {
        this.findAll({
          order: 'time DESC',
          limit: 50
        }).then(function(results) {
          var res = [];
          var todayCount = 0;

          for (var i in results) {
            var item = results[i];
            res.push(item);
            if (moment(item.time).isAfter(moment().startOf('day'))) {
              todayCount ++;
            }
          }
          res = _.uniq(res, function(feed) {
            return feed.name;
          });

          callback(res.slice(0, 10), todayCount);
        });
      },

      updateAfter: function(datetime, callback) {
        this.findAll({
          where: {
            time: {
              gt: datetime
            }
          },
          order: 'time ASC'
        }).then(function(results) {
          var res = _.uniq(results.map(function(item) {
            return item.name;
          }));
          if (callback) {
            callback(res);
          }
        })
      }
    }
  });

  return History;
};
