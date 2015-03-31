var path = require('path');
var Datastore = require('nedb');
var account = new Datastore({
  filename: path.join(CONFIG.wwwroot, 'db', 'account.db'),
  autoload: true
});

var Project = require('./project');

var save = exports.save = function(id, user, callback) {
  account.update({id: id}, user, {upsert: true}, function(err) {
    callback && callback(user);
  });
};

var getAccount = exports.get = function(id, callback) {
  account.findOne({
    id: id
  }, function(err, result) {
    callback && callback(result);
  });
};

var getAccountByName = exports.getByName = function(name, callback) {
  account.findOne({
    login: name
  }, function(err, result) {
    callback && callback(result);
  });
};

exports.getAll = function(callback) {
  account.find({}, function(err, result) {
    callback && callback(result);
  });
};

exports.authorize = function(name, authkey, callback) {
  getAccountByName(name, function(result) {
    if (result && result.authkey !== authkey) {
      result = null;
    }
    callback && callback(result);
  });
};

exports.delete = function(id, callback) {
  account.remove({id: id}, {}, callback);
};

var getPackages = exports.getPackages = function(id) {
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
    if (keys.length >= 1) {
      // only return item.id which type is string
      // for duplicate items
      callback(results.filter(function(item) {
        return typeof item.id === 'string';
      })[0]);
    } else {
      callback();
    }
  });
};

exports.addPackage = function(account, name, callback) {
  callback = callback || function() {};
  var p = new Project({
    name: name
  });
  if (!p.packages) {
    callback();
    return;
  }
  getAccountByName(account, function(result) {
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
};

exports.removePackage = function(account, name, callback) {
  callback = callback || function() {};
  var p = new Project({
    name: name
  });
  p.owners = p.owners || [];
  var ownerIds = p.owners.map(function(owner) {
    return owner && owner.id;
  });
  getAccountByName(account, function(result) {
    if (p.packages &&
        ownerIds.indexOf(result.id) >= 0 &&
        ownerIds.length !== 1) {
      p.owners.splice(ownerIds.indexOf(result.id), 1);
      p.save();
      callback(p.name);
    } else {
      callback();
    }
  });
};
