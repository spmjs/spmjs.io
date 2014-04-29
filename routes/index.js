var Project = require('../models/project');
var Package = require('../models/package');
var feed = require('../lib/feed');
var dependent = require('../lib/dependent');
var marked = require('marked');
var moment = require('moment');
var fs = require('fs');
var path = require('path');
var request = require('request');
var elastical = require('elastical');
var client = new elastical.Client();
var badge = require('../lib/badge');
var anonymous = CONFIG.authorize.type === 'anonymous';

exports.index = function(req, res) {
  feed.stat(function(recentlyUpdates, submitors, publishCount) {
    recentlyUpdates.forEach(function(item) {
      item.fromNow = moment(item.time).fromNow();
    });
    res.render('index', {
      title: CONFIG.website.title,
      count: Project.getAll().length,
      user: req.session.user,
      anonymous: anonymous,
      GA: CONFIG.website.GA,
      recentlyUpdates: recentlyUpdates,
      submitors: submitors,
      publishCount: publishCount,
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
    p.latest.readme = marked(p.latest.readme || '');

    var editable;
    if (p.owners && p.owners.length > 0 && req.session.user &&
        !anonymous && p.owners.indexOf(req.session.user.login) >= 0) {
      editable = true;
    }
    res.render('project', {
      title: p.name + ' - '+ CONFIG.website.title,
      user: req.session.user,
      anonymous: anonymous,
      GA: CONFIG.website.GA,
      project: p,
      doclink: docLink(p.name),
      editable: editable,
      errormessage: req.query.errormessage
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
    p.readme = marked(p.readme || '');
    res.render('package', {
      title: p.name + '@' + p.version + ' - '+ CONFIG.website.title,
      user: req.session.user,
      anonymous: anonymous,
      GA: CONFIG.website.GA,
      package: p
    });
  } else {
    next();
  }
};

exports.all = function(req, res) {
  res.render('packages', {
    title: 'All Packages - ' + CONFIG.website.title,
    user: req.session.user,
    anonymous: anonymous,
    GA: CONFIG.website.GA,
    packages: Project.getAll()
  });
};

exports.search = function(req, res, next) {
  var query = req.query.q;
  if (!query) {
    next();
    return;
  }
  client.search({
    query: query,
    index: 'spmjs',
    type: 'package',
  }, function(err, results) {
    results = results || { hits: [] };
    res.render('search', {
      title: 'Search Result - ' + CONFIG.website.title,
      user: req.session.user,
      anonymous: anonymous,
      GA: CONFIG.website.GA,
      query: query,
      result: results.hits.map(function(item) {
        return item._source;
      })
    });
  });
};

exports.badge = function(req, res) {
  var name = req.params.name;
  var p = new Project({
    name: name
  });
  var version = p.getLatestVersion();
  badge(res, name, version);
};

function docLink(name) {
  if (fs.existsSync(path.join(CONFIG.wwwroot, 'docs', name, 'latest'))) {
    return '/docs/' + name + '/latest/';
  }
}
