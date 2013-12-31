
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var nconf = require('nconf');
var MongoStore = require('connect-mongo')(express);

// Set up config *before* loading sub-modules, so they can user it.
nconf.argv()
     .env()
     .file('./config.json');
var dbOpts = nconf.get('database');

var wol = require('./routes/wol.js');
var userRoutes = require('./routes/user.js');

var app = express();

// all environments
app.set('port', process.env.PORT || nconf.get('port'));
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(nconf.get('cookieSecret')));
app.use(express.session({
        secret: nconf.get('cookieSecret'),
        cookie: { maxAge: 60000 * 60 * 24 },    // 24 hour session timeout
        store: new MongoStore({
            db: dbOpts.db,
            host: dbOpts.host,
            port: dbOpts.port,
            stringify: false    // Not stringifying makes things easier to debug in the mongo shell
        })
    }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// Wake-on-lan handler.
app.post('/api/wol/:mac', wol.post);

// User stuff.
userRoutes.addRoutes(app);

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
