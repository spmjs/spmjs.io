var Project = require('../models/project');
var Package = require('../models/package');
var feed = require('../lib/feed');
var dependent = require('../lib/dependent');
var marked = require('marked');
var moment = require('moment');
var fs = require('fs');
var path = require('path');
var request = require('request');

exports.index = function(req, res) {
  feed.get(function(recentlyUpdates) {
    recentlyUpdates.forEach(function(item) {
      item.fromNow = moment(item.time).fromNow();
    });
    res.render('index', {
      title: CONFIG.website.title,
      count: Project.getAll().length,
      recentlyUpdates: recentlyUpdates,
      mostDependents: dependent.getSortedDependents()
    });
  });
};

exports.project = function(req, res, next) {
  var name = req.params.name;
  var p = new Project({
    name: name
  });
  if (p.packages) {
    p.latest = new Package({
      name: p.name,
      version: p.version
    });
    p.versions = p.getVersions();
    p.latest.readme = marked(p.latest.readme);
    res.render('project', {
      title: p.name + ' - '+ CONFIG.website.title,
      project: p,
      doclink: docLink(p.name)
    });
  } else {
    next();
  }
};

exports.package = function(req, res, next) {
  var name = req.params.name;
  var version = req.params.version;
  var p = new Package({
    name: name,
    version: version
  });
  if (p.md5) {
    p.readme = marked(p.readme);
    res.render('package', {
      title: p.name + '@' + p.version + ' - '+ CONFIG.website.title,
      package: p
    });
  } else {
    next();
  }
};

exports.all = function(req, res) {
  res.render('packages', {
    title: 'All Packages - ' + CONFIG.website.title,
    packages: Project.getAll()
  });
};

exports.search = function(req, res, next) {
  var query = req.query.q;
  if (!query) {
    next();
    return;
  }
  res.render('search', {
    title: 'Search Result - ' + CONFIG.website.title,
    query: query,
    result: []
  });
};

function docLink(name) {
  if (fs.existsSync(path.join(CONFIG.wwwroot, 'docs', name, 'latest'))) {
    return '/docs/' + name + '/latest/';
  }
}
