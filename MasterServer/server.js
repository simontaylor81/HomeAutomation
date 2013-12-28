
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var wol = require('wake_on_lan');
var nconf = require('nconf');

var wol = require('./routes/wol.js');
var userRoutes = require('./routes/user.js');

// Set up config.
nconf.argv()
     .env()
     .file('./config.json');
//console.log(nconf.get('database:port'));

var app = express();

// all environments
app.set('port', process.env.PORT || nconf.get('port'));
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('v1qgWb6G33MtwoXv'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// Wake-on-lan handler.
app.post('/api/wol/:mac', wol.post);

// User stuff.
app.post('/user/login', userRoutes.postLogin);
app.get('/user/widgets', userRoutes.getWidgets);

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
