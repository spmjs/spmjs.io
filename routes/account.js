var request = require('request');
var account = require('../models/account');

var githubToken = require('github-token')({
  githubClient: 'b780a6efae6389352673',
  githubSecret: '35d009a30759ab3b9da4794128d336007030a466',
  baseURL: 'http://127.0.0.1:3000',
  callbackURI: '/callback',
  scope: 'user' // optional, default scope is set to user
});

exports.index = function(req, res) {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    var profile = req.session.user;
    res.render('account', {
      title: CONFIG.website.title,
      user: req.session.user,
      profile: profile,
      ownPackages: account.getPackages(profile.login),
      noexistedpackage: req.query.noexistedpackage,
      editable: true
    });
  }
};

exports.user = function(req, res, next) {
  account.get(req.params.user, function(user) {
    if (user) {
      var profile = user;
      var packages = account.getPackages(profile.login);
      res.render('account', {
        title: CONFIG.website.title,
        user: req.session.user,
        profile: user,
        ownPackages: packages,
        editable: false
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
          user.token = token;
          req.session.user = user;
          // save user to database
          account.save(user, function() {
            res.redirect('/');
          });
        }
      });
    });
};

exports.logout = function(req, res) {
  req.session.user = null;
  res.redirect('/');
};

exports.addOwnership = function(req, res) {
  var result = account.addPackage(req.session.user.login, req.body.package);
  res.redirect('/account' + (result?'':'?noexistedpackage='+req.body.package));
};
