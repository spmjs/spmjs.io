var debug = require('debug')('spmjs.io:sync:worker');
var fs = require('fs');
var join = require('path').join;
var dirname = require('path').dirname;
var request = require('request');
var async = require('async');
var mkdirp = require('mkdirp');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var rimraf = require('rimraf');
var remote = require('./remote');

var debug = console.log;

function Worker(options) {
  EventEmitter.call(this);
  this.names = options.names || [];
}

util.inherits(Worker, EventEmitter);

module.exports = Worker;

Worker.prototype.start = function() {
  this.next();
};

Worker.prototype.next = function() {
  var name = this.names.shift();
  if (!name) {
    return setImmediate(this.finish.bind(this));
  }

  remote.getPackage(name, function(err, pkg) {
    this._sync(name, pkg);
  }.bind(this));
};

Worker.prototype.finish = function() {
  this.emit('end');
};

Worker.prototype._sync = function(name, pkg, callback) {
  debug('--sync: %s', name);

  var localPkg = getLocalPkg(name);

  // Don't sync private package.
  if (localPkg && !localPkg.sync_from_remote) {
    return this.next();
  }

  if (pkg.statusCode === 404) {
    // Delete local package
    if (localPkg && localPkg.sync_from_remote) {
      deleteLocalPackage(name);
    }
    return this.next();
  }

  var unpublishedVersions = getUnpublishedVersions(pkg, localPkg);
  debug('  unpublished versions: %s', unpublishedVersions);
  unpublishedVersions.forEach(function(version) {
    deleteLocalVersionPackage(localPkg.packages[version]);
  });

  var missVersions = getMissVersions(pkg, localPkg);
  debug('  miss versions: %s', missVersions);

  if (!missVersions.length) {
    return this.next();
  }

  var self = this;

  async.eachSeries(missVersions, function(version, callback) {
    self._syncOneVersion(pkg.packages[version], callback);
  }, function(err) {

    remote.syncPackageInfo(name, function() {
      self.next();
      debug('  done');
    });

  });
};

Worker.prototype._syncOneVersion = function(pkg, callback) {
  debug('  sync %s@%s', pkg.name, pkg.version);
  async.parallel([
      // 1. index.json
      function(callback) {
        remote.syncVersionPackageInfo(pkg, callback);
      },
      // 2. tarball
      function(callback) {
        remote.syncVersionTarball(pkg, callback);
      }
    ], callback);
};

function getLocalPkg(name) {
  var filepath = join(CONFIG.wwwroot, 'repository', name, 'index.json');
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  }
}

function getUnpublishedVersions(pkg, localPkg) {
  if (!localPkg) {
    return [];
  }

  var ret = [];
  for (var k in localPkg.packages) {
    if (!pkg.packages[k]) {
      ret.push(k);
    }
  }
  return ret;
}

function getMissVersions(pkg, localPkg) {
  var versions = Object.keys(pkg.packages || {});

  // If local package not exists, sync all versions.
  if (!localPkg) {
    return versions;
  }

  var ret = [];
  for (var k in pkg.packages) {
    var rPkg = pkg.packages[k];
    var lPkg = localPkg.packages[k];
    if (!lPkg ||
      rPkg.updated_at != lPkg.updated_at ||
      rPkg.md5 != lPkg.md5 ||
      rPkg.author != lPkg.author
      ) {
      ret.push(k);
    }
  }
  return ret;
}

function deleteLocalPackage(name) {
  debug('  delete local package: %s', name);
  var localPath = join(CONFIG.wwwroot, 'repository', name);
  rimraf.sync(localPath);
}

function deleteLocalVersionPackage(pkg) {
  debug('  delete local package: %s@%s', pkg.name, pkg.version);
  var localPath = join(CONFIG.wwwroot, 'repository', pkg.name, pkg.version);
  rimraf.sync(localPath);
}
