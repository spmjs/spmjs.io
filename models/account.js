var path = require('path');
var Datastore = require('nedb');
var account = new Datastore({
  filename: path.join(CONFIG.wwwroot, 'db', 'account.db'),
  autoload: true
});

var Project = require('./project');

var save = exports.save = function(id, user, callback) {
  account.update({login: id}, user, {upsert: true}, function(err) {
    callback && callback(user);
  });
};

var getAccount = exports.get = function(id, callback) {
  account.findOne({
    login: id
  }, function(err, result) {
    callback && callback(result);
  });
};

exports.getAll = function(callback) {
  account.find({}, function(err, result) {
    callback && callback(result);
  });
};

exports.authorize = function(id, authkey, callback) {
  getAccount(id, function(result) {
    if (result && result.authkey !== authkey) {
      result = null;
    }
    callback && callback(result);
  });
};

exports.delete = function(id, callback) {
  account.remove({login: id}, {}, callback);
};

var getPackages = exports.getPackages = function(id) {
  var res = [];
  Project.getAll().forEach(function(name) {
    var p = new Project({
      name: name
    });
    var owners = p.owners || [];
    if (owners.indexOf(id) >= 0) {
      res.push(p.name);
    }
  });
  return res;
};

exports.checkPermission = function(id, name) {
  if (!id) {
    return false;
  }
  var packages = getPackages(id);
  return packages.indexOf(name) >= 0;
};

exports.getAccountByAuthkey = function(authkey, callback) {
  callback = callback || function() {};
  account.find({authkey: authkey}, function(err, results) {
    var keys = Object.keys(results);
    if (keys.length === 1) {
      callback(results[keys[0]].login);
    } else {
      callback();
    }
  });
};

exports.addPackage = function(id, name, callback) {
  callback = callback || function() {};
  var p = new Project({
    name: name
  });
  if (!p.packages) {
    callback();
    return;
  }
  getAccount(id, function(result) {
    if (!result) {
      callback();
      return;
    }
    p.owners = p.owners || [];
    if (p.owners.indexOf(id) < 0) {
      p.owners.push(id);
      p.save();
    }
    callback(p.name);
  });
};

exports.removePackage = function(id, name, callback) {
  callback = callback || function() {};
  var p = new Project({
    name: name
  });
  if (p.packages && p.owners.indexOf(id) >= 0 &&
      p.owners.length !== 1) {
    p.owners.splice(p.owners.indexOf(id), 1);
    p.save();
    callback(p.name);
  }
  callback();
};
