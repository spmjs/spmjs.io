var fs = require('fs');
var request = require('request');

module.exports = function(res, name, version) {
  var url;
  if (version) {
    name = name.replace(/-/g, '--');
    url = 'http://img.shields.io/badge/spm-v' + version + '-32B1FF.svg?style=flat';
  } else {
    url = 'http://img.shields.io/badge/spm-unknown-lightgrey.svg?style=flat';
  }
  request(url).pipe(res);
};
