var fs = require('fs-extra');
var path = require('path');
var static = require('node-static');
var baseUrl = CONFIG.wwwroot + '/docs';
var fileServer = new static.Server(baseUrl, {
  serverInfo: 'spm document service'
});

var res404 = {
  "status": 404,
  "headers": {
    "server": "spm document service"
  },
  "message": "Not Found"
};

module.exports = function(req, res) {
  var packageDir = req.params.name + '/' +req.params.version;

  // avoid "/docs/docs"
  req.url = req.url.replace(/^\/docs/, '');
  var extname = path.extname(req.url);

  // cmd wrapper
  if (extname === '.js') {
    fs.readFile(
      baseUrl + req.url,
      function(err, data) {
        if (err) {
          return res.send(404, res404);
        }
        // wrap CommonJS file to CMD
        if (!/define\s*\(function\s*\(\s*require/.test(data) &&
          req.url.indexOf('?nowrap') < 0) {
          data = 'define(function(require, exports, module) {\n' + data;
          data = '/* Wrapped to CMD by spm doc server */\n' + data;
          data += '\n});';
        }
        res.setHeader('Content-Type', 'application/javascript;charset=UTF-8');
        res.send(200, data);
      }
    );
    return;
  }

  // @import css
  var cssDeps = cssDependencies(baseUrl + '/' + packageDir);
  if (Object.keys(cssDeps).length > 0) {
    var ImportReg = new RegExp('/(' + Object.keys(cssDeps).join('|') + ')$');
    var importMatcher = req.url.match(ImportReg);
    if (importMatcher) {
      var name = importMatcher[1];
      var cssPath = cssDeps[name];
      fs.readFile(
        path.join(baseUrl, packageDir, cssPath), 'utf-8',
        function(err, data) {
          if (err) {
            return res.send(404, res404);
          }
          res.setHeader("Content-Type", 'text/css;charset=UTF-8');
          res.send(200, data);
        }
      );
      return;
    }
  }

  fileServer.serve(req, res, function(err) {
    if (err) {
      return res.send(404, res404);
    }
  });
};

function cssDependencies(basePath) {
  var ret = {};
  var modulesPath = path.join(basePath, 'sea-modules');
  try {
    var packages = fs.readdirSync(modulesPath);
  } catch(e) {
    return ret;
  }
  packages.forEach(function(p) {
    var versions = fs.readdirSync(path.join(modulesPath, p));
    versions.forEach(function(v) {
      var pkg = fs.readJsonSync(path.join(modulesPath, p, v, 'package.json'));
      pkg.spm = pkg.spm || {};
      var main = pkg.spm.main || '';
      if (/\.css$/.test(main)) {
        ret[pkg.name] = 'sea-modules/' + pkg.name + '/' + pkg.version + '/' + main;
      }
    });
  });
  return ret;
};
