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

exports.authorize = function(id, authkey, callback) {
  getAccount(id, function(result) {
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
    if (keys.length === 1) {
      callback(results[keys[0]]);
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
    var ownerIds = p.owners.map(function(owner) {
      return owner && owner.id;
    });
    if (ownerIds.indexOf(id) < 0) {
      p.owners.push({
        name: result.login,
        id: result.id
      });
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
  p.owners = p.owners || [];
  var ownerIds = p.owners.map(function(owner) {
    return owner && owner.id;
  });
  if (p.packages &&
      ownerIds.indexOf(id) >= 0 &&
      ownerIds.length !== 1) {
    p.owners.splice(ownerIds.indexOf(id), 1);
    p.save();
    callback(p.name);
  }
  callback();
};
