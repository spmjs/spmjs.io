
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var account = require('./routes/account');
var package = require('./routes/package');
var repository = require('./routes/repository');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(require('./middlewares/raw-body')({
  contentTypes: ['application/x-tar'],
  limit: '50mb'
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/account', account.index);
app.get('/account/setting', account.setting);
app.get('/package/:name', package.index);
app.get('/package/:name/:version', package.version);

app.get('/repository', repository.index);
app.get('/repository/:name', repository.project.get);
app.delete('/repository/:name', repository.project.delete);
app.get('/repository/:name/:version', repository.package.get);
app.post('/repository/:name/:version', repository.package.post);
app.put('/repository/:name/:version', repository.package.put);
app.delete('/repository/:name/:version', repository.package.delete);
app.get('/repository/:name/:version/:filename', repository.filename.get);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
