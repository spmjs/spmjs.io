var Project = require('../models/project');
var Package = require('../models/package');
var crypto = require('crypto');
var fs = require('fs-extra');
var path = require('path');
var tempfile = require('tempfile');
var tar = require('tarball-extract');
var hook = require('../lib/hook');
var elastical = require('elastical');
var client = new elastical.Client();
var account = require('../models/account');
var anonymous = CONFIG.authorize.type === 'anonymous';

exports.index = function(req, res) {
  res.set('Content-Type', 'application/json');
  var data = JSON.stringify(Project.getAll(), null, 2);
  if ('define' in req.query) {
    res.set('Content-Type', 'application/javascript');
    data = 'define(' + data + ');';
  }
  res.send(200, data);
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
      var data = JSON.stringify(p, null, 2);
      if ('define' in req.query) {
        res.set('Content-Type', 'application/javascript');
        data = 'define(' + data + ');';
      }
      res.send(200, data);
    }
  },
  delete: function(req, res) {
    var project = new Project(req.params);
    if (!project.packages) {
      abortify(res, { code: 404 });
    } else {
      hook.emit('delete:project', project, req.body.publisher);
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
      var data = JSON.stringify(p, null, 2);
      res.set('Content-Type', 'application/json');
      if ('define' in req.query) {
        res.set('Content-Type', 'application/javascript');
        data = 'define(' + data + ');';
      }
      res.send(200, data);
    }
  },
  checkPermission: function(req, res, next) {
    var name = req.params.name || req.body.name;
    var authkey = (req.headers.authorization || '').replace(/^Yuan /, '');
    var p = new Project({
      name: name
    });
    if (anonymous) {
      next();
    } else {
      account.getAccountByAuthkey(authkey, function(publisher) {
        if (!publisher) {
          return abortify(res, { code: 401 });
        }
        var permission = (!p.created_at) || account.checkPermission(publisher, name);
        if (!permission) {
          return abortify(res, { code: 403 });
        }
        req.body.publisher = publisher;
        next();
      });
    }
  },
  post: function(req, res) {
    var name = req.body.name.toLowerCase();
    if (CONFIG.reservedWords.split(' ').indexOf(name) >= 0) {
      return abortify(res, {
        code: 406,
        message: 'Sorry, package name is a reserved name.'
      });
    }
    var name = req.body.name;
    var data = CacheData = req.body;

    // fill spm key in package
    data.spm = data.spm || {};
    data.spm.main = data.spm.main || 'index.js';

    var isNewProject;
    Cache.project = new Project(data);
    Cache.package = new Package(data);
    var isNewProject = !Cache.project['created_at'];
    if (isNewProject) {
      data.owners = [data.publisher];
    }
    Cache.project.update(data);
    if (isNewProject) {
      hook.emit('create:project', Cache.project, data.publisher);
    }
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

    var force = req.headers['x-yuan-force'];
    if(package.md5 && !force) {
      return abortify(res, { code: 444 });
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
    hook.emit('update:package', package);

    res.send(200, package);
  },
  delete: function(req, res) {
    var package = new Package(req.params);
    var project = new Project(req.params);
    if (!package.md5) {
      abortify(res, { code: 404 });
    } else {
      hook.emit('delete:package', package);
      var leftPackageCount = project.remove(package.version);
      if (leftPackageCount <= 0) {
        hook.emit('delete:project', project, req.body.publisher);
      }
      res.send(200, {
        status: 'info',
        message: 'Package is deleted.'
      });
    }
  }
};

exports.filename = {
  get: function(req, res) {
    fs.readFile(path.join(CONFIG.wwwroot, 'repository',
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
      var package = new Package({
        name: req.params.name,
        version: req.params.version
      });
      hook.emit('download:package', package);
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
      return abortify(res, { code: 415 });
    }
    var dest;
    if (tag === 'latest') {
      dest = path.join(CONFIG.wwwroot, 'docs', name, tag);
    }
    if (fs.existsSync(dest)) {
      fs.removeSync(dest);
    }

    var version = req.body.version;
    var versionDir;
    if (version) {
      versionDir = path.join(CONFIG.wwwroot, 'docs', name, version);
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

exports.search = function(req, res, next) {
  var query = req.query.q;
  if (!query) {
    return abortify(res, { code: 404 });
  }
  client.search({
    query: query,
    index: 'spmjs',
    type: 'package',
  }, function(err, results) {
    var data = [];
    results = results || { hits: [] };
    results.hits.forEach(function(item) {
      var p = new Project({
        name: item._source.name
      });
      data.push({
        name: p.name,
        description: p.description,
        keywords: p.keywords,
        homepage: p.homepage,
        repository: p.repository && p.repository.url
      });
    });
    res.send(200, {
      data: {
        total: data.length,
        results: data
      }
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
