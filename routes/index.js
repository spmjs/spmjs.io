var Project = require('../models/project');
var Package = require('../models/package');
var account = require('../models/account');
var history= require('../lib/history');
var download = require('../lib/download');
var dependent = require('../lib/dependent');
var moment = require('moment');
var fs = require('fs');
var path = require('path');
var request = require('request');
var elastical = require('elastical');
var client = new elastical.Client();
var badge = require('../lib/badge');
var anonymous = CONFIG.authorize.type === 'anonymous';
var _ = require('lodash');
var capitalize = require('capitalize');
var gu = require('githuburl');
var async = require('async');
var spmjsioVersion = require('../package').version;

var marked = require('marked');
var renderer = new marked.Renderer();
renderer.heading = function(text, level) {
  var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  return '<h' + level + ' id="' + escapedText + '">' + text + '<a name="' + escapedText +
         '" class="anchor" href="#' + escapedText +
         '"><span class="header-link iconfont">&#xe601;</span></a></h' + level + '>';
};

// Synchronous highlighting with highlight.js
marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

exports.index = function(req, res) {
  async.parallel([
    function(callback) {
      download.stat(function(downloadResult) {
        callback(null, downloadResult);
      });
    },
    function(callback) {
      history.stat(function(recentlyUpdates, publishCount) {
        callback(null, {
          recentlyUpdates: recentlyUpdates,
          publishCount: publishCount
        });
      });
    },
    function(callback) {
      if (anonymous) {
        callback();
      } else {
        account.getAll(function(users) {
          callback(null, users);
        });
      }
    }
  ],
  // optional callback
  function(err, results) {
    var todayCount = results[0].todayCount;
    var recentlyPackages = results[0].recentlyPackages;
    var recentlyUpdates = results[1].recentlyUpdates;
    var publishCount = results[1].publishCount;
    var users = results[2];

    recentlyUpdates.forEach(function(item) {
      item.fromNow = moment(item.time).fromNow();
    });
    var data = {
      title: CONFIG.website.title,
      spmjsioVersion: spmjsioVersion,
      count: Project.getAll().length,
      user: req.session.user,
      anonymous: anonymous,
      GA: CONFIG.website.GA,
      recentlyUpdates: recentlyUpdates,
      publishCount: publishCount,
      todayCount: todayCount,
      recentlyPackages: recentlyPackages,
      mostDependents: dependent.getSortedDependents()
    };
    if (!anonymous) {
      var submitors = [];
      users.forEach(function(u) {
        if (u.count && u.count > 0) {
          submitors.push({
            login: u.login,
            count: u.count
          });
        }
      });
      data.submitors = submitors.sort(function(a, b) {
        return b.count - a.count;
      });
      data.submitors = data.submitors.slice(0, 10);
    }
    res.render('index', data);
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
    p.fromNow = moment(p.updated_at).fromNow();
    p.latest.readme = marked(p.latest.readme || '');
    // jquery@1.7.2 -> jquery
    p.latest.dependencies = _.uniq((p.latest.dependencies || []).map(function(d) {
      return d.split('@')[0];
    }));
    p.latest.dependents = _.uniq((p.latest.dependents || []).map(function(d) {
      return d.split('@')[0];
    }));

    var editable;
    if (p.owners && p.owners.length > 0 && req.session.user &&
        !anonymous && p.owners.indexOf(req.session.user.login) >= 0) {
      editable = true;
    }
    if (p.repository && p.repository.url) {
      try {
        p.repositoryurl = gu(p.repository.url).http_href;
      } catch(e) {
        p.repositoryurl = '';
      }
    }
    res.render('project', {
      title: p.name + ' - '+ CONFIG.website.title,
      spmjsioVersion: spmjsioVersion,
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
    p.fromNow = moment(p.updated_at).fromNow();
    // jquery@1.7.2 -> jquery
    p.dependents = _.uniq((p.dependents || []).map(function(d) {
      return d.split('@')[0];
    }));
    if (p.repository && p.repository.url) {
      try {
        p.repositoryurl = gu(p.repository.url).http_href;
      } catch(e) {
        p.repositoryurl = '';
      }
    }
    res.render('package', {
      title: p.name + '@' + p.version + ' - '+ CONFIG.website.title,
      spmjsioVersion: spmjsioVersion,
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
    spmjsioVersion: spmjsioVersion,
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
  // http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html
  client.search({
    query: {
      "multi_match" : {
        "query" : query,
        "fields" : [ "name^3", "description", "keywords" ]
      }
    },
    index: 'spmjs',
    size: 100,
    type: 'package',
  }, function(err, results) {
    results = results || { hits: [] };
    res.render('search', {
      title: 'Search Result - ' + CONFIG.website.title,
      spmjsioVersion: spmjsioVersion,
      user: req.session.user,
      anonymous: anonymous,
      GA: CONFIG.website.GA,
      query: query,
      result: results.hits.map(function(item) {
        var p = new Project({
          name: item._source.name
        });
        if (p && p.packages) {
          item._source.version = p.getLatestVersion();
        }
        return item._source;
      })
    });
  });
};

exports.suggest = function(req, res, next) {
  var query = req.query.q;
  if (!query) {
    res.status(200).send([]);
    return;
  }
  // http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html
  client.search({
    query: {
      "prefix": {
        "suggest": {
          "value": query
        }
      }
    },
    index: 'spmjs',
    size: 6,
    type: 'package',
  }, function(err, results) {
    results = results || { hits: [] };
    res.status(200).send(results.hits.map(function(item) {
      return item._source;
    }));
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

var DocumentationOrder = {
  'getting-started': 1,
  'develop-a-package': 2,
  'package.json': 3,
  'spm-commands': 4,
  'difference-from-2.x': 5
};

exports.documentation = function(req, res, next) {
  var title = req.params.title || 'getting-started';
  var content = (fs.readFileSync(path.join('documentation', title + '.md')) || '').toString();
  content = marked(content, {
    renderer: renderer
  });

  var nav = fs.readdirSync('documentation');
  nav = nav.map(function(item, i) {
    item = item.replace('.md', '');
    return {
      text: item,
      current: (item === title),
      index: DocumentationOrder[item] || 100
    };
  });

  nav = nav.sort(function(a, b) {
    return a.index - b.index;
  });

  res.render('documentation', {
    title: capitalize.words(title.replace(/-/g, ' ')) + '- spm documentation',
    spmjsioVersion: spmjsioVersion,
    user: req.session.user,
    anonymous: anonymous,
    nav: nav,
    GA: CONFIG.website.GA,
    content: content
  });
};

function docLink(name) {
  if (fs.existsSync(path.join(CONFIG.wwwroot, 'docs', name, 'latest'))) {
    return '/docs/' + name + '/latest/';
  }
}
