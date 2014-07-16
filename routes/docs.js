var fs = require('fs-extra');
var path = require('path');
var serveSpm = require('serve-spm');

module.exports = function(req, res, next) {
  var packageDir = path.join('docs', req.params.name, req.params.version);

  // modify req.url for serve-spm
  req.url = req.url.replace(packageDir, '');

  serveSpm(path.resolve(path.join(CONFIG.wwwroot, packageDir)))(req, res, next);
};
