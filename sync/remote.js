var join = require('path').join;
var dirname = require('path').dirname;
var request = require('request');
var ms = require('ms');
var mkdirp = require('mkdirp');
var fs = require('fs');
var crypto = require('crypto');
var appendFile = require('fs').appendFileSync;
var readFile = require('fs').readFileSync;
var log = require('./log');
var moment = require('moment');

exports.getPackage = function(name, callback) {
  var url = CONFIG.syncSource + '/repository/' + name;
  request(url, {json:true}, function(err, res, body) {
    callback(err, body);
  });
};

exports.getPackages = function(info, callback) {
  var api;
  if (!info || !info.last_sync_time) {
    api = '/repository';
  } else {
    api = '/repository/since?update_after=' + (info.last_sync_time - ms('10m'));
  }
  request(CONFIG.syncSource + api, {json:true}, function(err, res, packages) {
    callback(err, packages);
  });
};

exports.syncVersionPackageInfo = function(pkg, callback) {
  var remotePath = CONFIG.syncSource + join('/repository', pkg.name, pkg.version);
  var localPath = join(CONFIG.wwwroot, 'repository', pkg.name, pkg.version, 'index.json');
  mkdirp.sync(dirname(localPath));
  request(remotePath, callback)
    .pipe(fs.createWriteStream(localPath));
};

exports.syncVersionTarball = function(pkg, callback) {
  var remotePath = CONFIG.syncSource + join('/repository', pkg.name, pkg.version, pkg.filename);
  var localPath = join(CONFIG.wwwroot, 'repository', pkg.name, pkg.version, pkg.filename);
  mkdirp.sync(dirname(localPath));
  request(remotePath, callback)
    .pipe(fs.createWriteStream(localPath))
    .on('finish', function() {
      if (md5file(localPath) !== pkg.md5) {
        log('  sync tarball error: %s@%s', pkg.name, pkg.version);
        var msg = '['+moment().format('YYYY-MM-DD HH:mm:SS')+'] ' + pkg.name + '@' + pkg.version;
        appendFile(join(CONFIG.wwwroot, 'sync.error.log'), msg);
      }
    });
};

exports.syncPackageInfo = function(name, callback) {
  var remotePath = CONFIG.syncSource + join('/repository', name);
  var localPath = join(CONFIG.wwwroot, 'repository', name, 'index.json');

  mkdirp.sync(dirname(localPath));
  request(remotePath, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    var pkg = JSON.parse(body);
    pkg.sync_from_remote = true;
    // TODO: format
    var data = JSON.stringify(pkg);
    fs.writeFileSync(localPath, data, 'utf-8');
    callback();
  });
};

function md5file(fpath) {
  var md5 = crypto.createHash('md5');
  return md5.update(readFile(fpath)).digest('hex');
}
