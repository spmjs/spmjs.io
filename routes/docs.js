var fs = require('fs-extra');
var path = require('path');
var serveSpm = require('serve-spm');

module.exports = function(req, res, next) {
  var packageDir = path.join('docs', req.params.name, req.params.version);

  serveSpm(path.resolve(path.join(CONFIG.wwwroot, packageDir)), {
    paths: [
      ['/docs/' + req.params.name + '/' + req.params.version, '']
    ]
  })(req, res, next);
};
