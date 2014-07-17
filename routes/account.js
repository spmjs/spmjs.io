var request = require('request');
var url = require('url');
var account = require('../models/account');
var anonymous = CONFIG.authorize.type === 'anonymous';
var crypto = require('crypto');
var spmjsioVersion = require('../package').version;

var githubToken = require('github-token')({
  githubClient: CONFIG.authorize.clientId,
  githubSecret: CONFIG.authorize.clientSecret,
  baseURL: CONFIG.authorize.baseURL,
  callbackURI: 'callback',
  scope: 'user' // optional, default scope is set to user
});

exports.index = function(req, res) {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    var profile = req.session.user;
    res.render('account', {
      title: 'My account - ' + CONFIG.website.title,
      spmjsioVersion: spmjsioVersion,
      user: req.session.user,
      anonymous: anonymous,
      GA: CONFIG.website.GA,
      profile: profile,
      ownPackages: account.getPackages(profile.login),
      errormessage: req.query.errormessage
    });
  }
};

exports.user = function(req, res, next) {
  account.get(req.params.user, function(user) {
    if (user) {
      var profile = user;
      // not show authkey in public profile
      profile.authkey = null;
      var packages = account.getPackages(profile.login);
      res.render('account', {
        title: user.login + ' - ' + CONFIG.website.title,
        spmjsioVersion: spmjsioVersion,
        user: req.session.user,
        anonymous: anonymous,
        GA: CONFIG.website.GA,
        profile: user,
        ownPackages: packages
      });
    } else {
      next();
    }
  });
};

exports.login = function(req, res) {
  if (!req.session.user) {
    return githubToken.login(req, res);
  } else {
    res.redirect('/');
  }
};

exports.callback = function(req, res) {
  return githubToken.callback(req, res)
    .then(function(token) {
      request.get({
        url: 'https://api.github.com/user?access_token=' + token.access_token,
        headers: {
          'User-Agent': 'spmjs'
        }
      }, function(err, response, body) {
        if (!err && response.statusCode === 200) {
          var user = JSON.parse(body);
          // authkey is the md5 value of github token
          user.authkey = crypto.createHash('md5').update(token.access_token).digest('hex');
          req.session.user = user;
          // save user to database
          account.save(user.login, {
            $set: user
          }, function() {
            res.redirect('/account');
          });
        }
      });
    });
};

exports.logout = function(req, res) {
  req.session.user = null;
  res.redirect('/');
};

// for spm login
exports.authorize = function(req, res) {
  var id = req.body.account;
  var authkey = req.body.authkey;
  account.authorize(id, authkey, function(result) {
    if (result) {
      res.send(200, {
        data: authkey
      });
    } else {
      res.send(403, {
        message: 'username or authkey is wrong.'
      });
    }
  });
};

exports.ownership =  function(req, res) {
  if (!req.session.user) {
    res.send(401);
    return;
  }
  var errormessage;
  var action;

  if (req.method === 'POST') {
    action = 'add';
    errormessage = '?errormessage=account ' + req.body.account + ' not existed';
  } else if (req.method === 'DELETE') {
    action = 'remove';
    errormessage = '?errormessage=your are the only owner of ' + req.body.package;
  }

  account[action + 'Package'](req.body.account, req.body.package, function(result) {
    if (result) {
      errormessage = '';
    }
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      if (errormessage) {
        res.send(403, {
          errormessage: errormessage
        });
      } else {
        res.send(200);
      }
    } else {
      res.redirect(url.parse(req.headers.referer).pathname + errormessage);
    }
  });
};
