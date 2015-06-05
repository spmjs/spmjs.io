'use strict';

var Project = require('./project');

module.exports = function(sequelize, DataTypes) {

  var Account = sequelize.define('Account', {

    id: DataTypes.INTEGER,
    login: {
      type: DataTypes.STRING,
      unique: true
    },
    avatar_url: DataTypes.STRING,
    url: DataTypes.STRING,
    html_url: DataTypes.STRING,
    name: DataTypes.STRING,
    company: DataTypes.STRING,
    blog: DataTypes.STRING,
    location: DataTypes.STRING,
    email: DataTypes.STRING,
    bio: DataTypes.STRING,
    public_repos: DataTypes.INTEGER,
    public_gists: DataTypes.INTEGER,
    followers: DataTypes.INTEGER,
    following: DataTypes.INTEGER,
    authkey: DataTypes.STRING,
    count: DataTypes.INTEGER
  }, {
    classMethods: {

      getAccountByAuthkey: function(authkey, callback) {
        this.findOne({
          where: {
            authkey: authkey
          }
        }).then(callback);
      },

      getPackages: function(id) {
        var res = [];
        Project.getAll().forEach(function(name) {
          var p = new Project({
            name: name
          });
          var owners = p.owners || [];
          var ownerIds = owners.map(function(owner) {
            return owner && owner.id;
          });
          if (ownerIds.indexOf(id) >= 0) {
            res.push(p.name);
          }
        });
        return res;
      },

      checkPermission: function(id, name) {
        if (!id) {
          return false;
        }
        var packages = this.getPackages(id);
        return packages.indexOf(name) >= 0;
      },

      getByName: function(name, callback) {
        this.findOne({
          where: {
            login: name
          }
        }).then(function (result) {
          callback && callback(result);
        });
      },

      authorize: function(name, authkey, callback) {
        this.getByName(name, function(result) {
          if (result && result.authkey !== authkey) {
            result = null;
          }
          callback && callback(result);
        });
      },

      addPackage: function(account, name, callback) {
        callback = callback || function() {};
        var p = new Project({
          name: name
        });
        if (!p.packages) {
          callback();
          return;
        }
        this.getByName(account, function(result) {
          if (!result) {
            callback();
            return;
          }
          p.owners = p.owners || [];
          var ownerIds = p.owners.map(function(owner) {
            return owner && owner.id;
          });
          if (ownerIds.indexOf(result.id) < 0) {
            p.owners.push({
              name: result.login,
              id: result.id
            });
            p.save();
          }
          callback(p.name);
        });
      },

      removePackage: function(account, name, callback) {
        callback = callback || function() {};
        var p = new Project({
          name: name
        });
        p.owners = p.owners || [];
        var ownerNames = p.owners.map(function(owner) {
          return owner && owner.name;
        });
        if (p.packages &&
            ownerNames.indexOf(account) >= 0 &&
            ownerNames.length !== 1) {
          p.owners.splice(ownerNames.indexOf(account), 1);
          p.save();
          callback(p.name);
        } else {
          callback();
        }
      }

    }
  });

  return Account;

};

//var save = exports.save = function(id, user, callback) {
//  account.update({id: id}, user, {upsert: true}, function(err) {
//    callback && callback(user);
//  });
//};
//
//var getAccount = exports.get = function(id, callback) {
//  account.findOne({
//    id: id
//  }, function(err, result) {
//    callback && callback(result);
//  });
//};
//
//exports.getAll = function(callback) {
//  account.find({}, function(err, result) {
//    callback && callback(result);
//  });
//};
//
//exports.delete = function(id, callback) {
//  account.remove({id: id}, {}, callback);
//};
//


