var Project = require('../models/project');
var Package = require('../models/package');
var crypto = require('crypto');
var fs = require('fs-extra');
var path = require('path');
var tempfile = require('tempfile');
var tar = require('tarball-extract');

exports.index = function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send(200, JSON.stringify(Project.getAll()));
};

exports.project = {
  get: function(req, res) {
    var p = new Project({
      name: req.params.name
    });
    if (!p.version) {
      abortify(res, { code: 404 });
    } else {
      res.set('Content-Type', 'application/json');
      res.send(200, JSON.stringify(p));
    }
  },
  delete: function(req, res) {
    var project = new Project(req.params);
    if (!project.name) {
      abortify(res, { code: 404 });
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
      abortify(res, { code: 404 });
    } else {
      res.set('Content-Type', 'application/json');
      res.send(200, JSON.stringify(p));
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
      abortify(res, { code: 404 });
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
      abortify(res, { code: 404 });
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
      if (err) {
        abortify(res, { code: 404 });
      }
      if (path.extname(req.params.filename) === '.json') {
        res.set('Content-Type', 'application/json');
      }
      res.send(data);
    });
  }
};

exports.upload = function(req, res) {
  var tarball = req.files.file;
  if (!tarball) {
    return abortify(res, {
      code: 406,
      message: 'file is missing.'
    });
  }

  var name = req.body.name;
  var tag = req.body.tag;
  var filename = tarball.name;

  var fpath = path.join(path.dirname(tempfile()), filename);
  if (fs.existsSync(fpath)) {
    fs.removeSync(fpath);
  }

  tar.extractTarball(tarball.path, fpath, function(err) {
    if(err) {
      console.log(err);
      return abortify(res, { code: 415 });
    }
    var dest;
    if (tag === 'latest') {
      dest = path.join('data', 'docs', name);
    } else {
      dest = path.join('data', 'archive', name, tag);
    }
    if (fs.existsSync(dest)) {
      fs.removeSync(dest);
    }

    var version = req.body.version;
    var versionDir;
    if (version) {
      versionDir = path.join('data', 'archive', name, version);
      if (fs.existsSync(versionDir)) {
        fs.removeSync(versionDir);
      }
      fs.copySync(fpath, versionDir);
    }

    fs.copySync(fpath, dest);

    res.send(200, {
      status: 'info',
      message: 'Upload docs success.'
    });
  });

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
    statusCode: code,
    status: status,
    message: message
  });
}
