
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var serveStatic = require('serve-static');
var fs = require('fs-extra');
var spmjsioVersion = require('./package').version;

// load global config
var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
global.CONFIG = CONFIG;

// start sync
require('./sync');

// mkdir data directory
if (!fs.existsSync(CONFIG.wwwroot)) {
  fs.mkdirSync(CONFIG.wwwroot);
}
if (!fs.existsSync(path.join(CONFIG.wwwroot, 'db'))) {
  fs.mkdirSync(path.join(CONFIG.wwwroot, 'db'));
}
if (!fs.existsSync(path.join(CONFIG.wwwroot, 'docs'))) {
  fs.mkdirSync(path.join(CONFIG.wwwroot, 'docs'));
}
if (!fs.existsSync(path.join(CONFIG.wwwroot, 'repository'))) {
  fs.mkdirSync(path.join(CONFIG.wwwroot, 'repository'));
}

var routes = require('./routes');
var account = require('./routes/account');
var repository = require('./routes/repository');
var docs = require('./routes/docs');

var app = express();

// all environments
app.set('port', CONFIG.server.port || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan());
app.use(require('./middlewares/raw-body')({
  contentTypes: ['application/x-tar'],
  limit: '50mb'
}));
app.use(bodyParser());
app.use(cookieParser('spmjs'));
app.use(session({ secret: 'keyboard cat', key: 'sid' }));
app.use(serveStatic(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(require('errorhandler')());
}

app.get('/', routes.index);
app.get('/search', routes.search);
app.get('/suggest', routes.suggest);
app.get('/packages', routes.all);
app.get('/package/:name', routes.project);
app.get('/package/:name/:version', routes.package);
app.get('/badge/:name', routes.badge);
app.get('/documentation', routes.documentation);
app.get('/documentation/:title', routes.documentation);

app.get('/login', account.login);
app.get('/callback', account.callback);
app.get('/logout', account.logout);
app.get('/account', account.index);
app.post('/account/login', account.authorize);
app.get('/account/:user', account.user);
app.post('/ownership', account.ownership);
app.delete('/ownership', account.ownership);

app.get('/repository', repository.index);
app.post('/repository/upload', multipartMiddleware, repository.package.checkPermission, repository.upload);
app.get('/repository/search', repository.search);
app.get('/repository/since', repository.since);
app.get('/repository/:name', repository.project.get);
app.delete('/repository/:name', repository.package.checkPermission, repository.project.delete);
app.get('/repository/:name/:version', repository.package.get);
app.post('/repository/:name/:version', repository.package.checkPermission, repository.package.post);
app.put('/repository/:name/:version', repository.package.put);
app.delete('/repository/:name/:version', repository.package.checkPermission, repository.package.delete);
app.get('/repository/:name/:version/:filename', repository.filename.get);

app.get('/repositories', repository.data);

app.get('/docs/:name/:version/*', docs);

// 404
app.get('*', function(req, res) {
  res.status(404).render('404.ejs', {
    title: 'No Found - ' + CONFIG.website.title,
    spmjsioVersion: spmjsioVersion,
    anonymous: CONFIG.authorize.type === 'anonymous',
    user: req.session.user,
    GA: CONFIG.website.GA
  });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
