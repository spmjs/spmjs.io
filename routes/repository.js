var Project = require('../models/project');
var Package = require('../models/package');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

exports.index = function(req, res) {
  res.send("respond with a resource");
};

exports.project = {
  get: function(req, res) {
    var p = new Project({
      name: req.params.name
    });
    if (!p.version) {
      res.send(404, JSON.stringify(p));
    } else {
      res.send(JSON.stringify(p));
    }
  },
  delete: function(req, res) {
    var project = new Project(req.params);
    if (!project.name) {
      res.send(404, JSON.stringify(p));
    } else {
      project.delete();
      res.send(200, {
        status: 'info',
        message: 'Project is deleted.'
      });
    }
  }
};

var Cache = {};
exports.package = {
  get: function(req, res) {
    var p = new Package({
      name: req.params.name,
      version: req.params.version
    });
    if (!p.md5) {
      res.send(404, JSON.stringify(p));
    } else {
      res.send(JSON.stringify(p));
    }
  },
  post: function(req, res) {
    var data = CacheData = req.body;
    Cache.project = new Project(data);
    Cache.package = new Package(data);
    Cache.project.update(data);
    res.send(200);
  },
  put: function(req, res) {
    var data = req.body;
    var package = Cache.package;
    var project = Cache.project;
    if (!package) {
      abortify(res, {
        code: 404,
        message: 'Package not found.'
      });
      return;
    }
    var encoding = req.headers['content-encoding'];
    var ctype = req.headers['content-type'];
    if (ctype == 'application/x-tar' && encoding == 'gzip') {
      ctype = 'application/x-tar-gz'
    }
    if (ctype !== 'application/x-tar-gz' && ctype !== 'application/x-tgz') {
      abortify(res, {
        code: 415,
        message: 'Only gziped tar file is allowed.'
      });
    }
    package.md5 = crypto.createHash('md5').update(req.body).digest('hex');
    var md5 = req.headers['x-package-md5'];
    if (md5 && md5 !== package.md5) {
      abortify(res, {
        code: 400,
        message: 'MD5 does not match.'
      });
    }

    package.saveTarfile(req.body);
    package.save();
    project.update(package);
    project.save();

    res.send(200, package);
  },
  delete: function(req, res) {
    var package = new Package(req.params);
    var project = new Project(req.params);
    if (!package.name) {
      res.send(404, JSON.stringify(p));
    } else {
      project.remove(project.version);
      package.delete();
      res.send(200, {
        status: 'info',
        message: 'Package is deleted.'
      });
    }
  }
};

exports.filename = {
  get: function(req, res) {
    fs.readFile(path.join('data', 'repository',
      req.params.name,
      req.params.version,
      req.params.filename
    ), function(err, data) {
      res.send(data);
    });
  }
};

function abortify(res, options) {
  code = options.code || 401;
  status = options.status || 'error';

  var msgs = {
    400: 'Bad request.',
    401: 'Authorization required.',
    403: 'Permission denied.',
    404: 'Not found.',
    406: 'Not acceptable.',
    415: 'Unsupported media type.',
    426: 'Upgrade required.',
    444: 'Force option required.'
  };
  message = options.message || msgs[code];
  res.send(code, {
    status: status,
    message: message
  });
}

// TODO:
//   1. auth
//   2. force
//   3. remove
//   4. publisher
//   5. ANONYMOUS
