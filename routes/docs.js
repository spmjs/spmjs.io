var fs = require('fs-extra');
var path = require('path');
var serveSpm = require('serve-spm');

module.exports = function(req, res, next) {
  var packageDir = path.join('docs', req.params.name, req.params.version);

  var root = path.resolve(path.join(CONFIG.wwwroot, packageDir));

  // doc built with spm-webpack will generatei test.js in dist
  if (fs.existsSync(path.join(root, 'dist/test.js'))) {
    return next();
  }

  serveSpm(root, {
    paths: [
      ['/docs/' + req.params.name + '/' + req.params.version, '']
    ],
    cache: true
  })(req, res, next);
};
