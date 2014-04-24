var Project = require('../models/project');
var Package = require('../models/package');

exports.index = function(req, res){
  res.render('index', {
    title: CONFIG.website.title
  });
};

exports.project = function(req, res){
  var name = req.params.name;
  var p = new Project({
    name: name
  });
  if (p.packages) {
    p.title = CONFIG.website.title;
    p.latest = p.packages[p.version];
    p.versions = p.getVersions().join(', ');
    res.render('project', p);
  } else {
    res.render('404', {
      title: CONFIG.website.title
    });
  }
};

exports.package = function(req, res){
  var name = req.params.name;
  var version = req.params.version;
  var p = new Package({
    name: name,
    version: version
  });
  if (p.md5) {
    p.title = CONFIG.website.title;
    res.render('project', p);
  } else {
    res.render('404', {
      title: CONFIG.website.title
    });
  };
};
