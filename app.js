
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var account = require('./routes/account');
var repository = require('./routes/repository');
var http = require('http');
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var favicon = require('static-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var serveStatic = require('serve-static');

var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
global.CONFIG = CONFIG;

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
app.use(cookieParser('your secret here'));
app.use(serveStatic(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(require('errorhandler')())
}

app.get('/', routes.index);
app.get('/account', account.index);
app.get('/account/setting', account.setting);
app.get('/package/:name', routes.project);
app.get('/package/:name/:version', routes.package);

app.get('/repository', repository.index);
app.get('/repository/:name', repository.project.get);
app.delete('/repository/:name', repository.project.delete);
app.get('/repository/:name/:version', repository.package.get);
app.post('/repository/:name/:version', repository.package.post);
app.put('/repository/:name/:version', repository.package.put);
app.delete('/repository/:name/:version', repository.package.delete);
app.get('/repository/:name/:version/:filename', repository.filename.get);

app.post('/repository/upload', multipartMiddleware, repository.upload);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
