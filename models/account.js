var path = require('path');
var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());
var account = nStore.new(path.join(CONFIG.wwwroot, 'db', 'account.db'));
var Project = require('./project');

var save = exports.save = function(user, callback) {
  console.log(user.login, user);
  account.save(user.login, user, function(err) {
    callback && callback(user);
  });
};

exports.get = function(id, callback) {
  account.get(id, function(err, result) {
    callback && callback(result);
  });
};

exports.authorize = function(id, authKey, callback) {
  account.get(id, function(err, result) {
    if (result && result.token !== authKey) {
      result = null;
    }
    callback && callback(result);
  });
};

exports.delete = function(id, callback) {
  account.remove(id, callback);
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
  account.find({token: authkey}, function(err, results) {
    var keys = Object.keys(results);
    if (keys.length === 1) {
      callback(results[keys[0]].login);
    } else {
      callback();
    }
  });
};

exports.addPackage = function(id, name) {
  var p = new Project({
    name: name
  });
  if (p.packages) {
    p.owners = p.owners || [];
    if (p.packages && p.owners.indexOf(id) < 0) {
      p.owners.push(id);
      p.save();
      return p.name;
    }
    return true;
  }
};

exports.removePackage = function(id, name) {
  var p = new Project({
    name: name
  });
  if (p.packages && p.owners.indexOf(id) >= 0 &&
      p.owners.length !== 1) {
    p.owners.splice(p.owners.indexOf(id), 1);
    p.save();
    return p.name;
  }
};
