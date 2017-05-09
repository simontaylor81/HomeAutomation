
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var nconf = require('nconf');

// All paths are relative to the script root, so change the working directory to it.
process.chdir(__dirname);

// Set up config *before* loading sub-modules, so they can use it.
nconf.argv()
     .env()
     .file('./config.json');

var wol = require('./server/routes/wol.js');
var onkyo = require('./server/routes/onkyo.js');
var userRoutes = require('./server/routes/user.js');

if (nconf.get('enableIcons')) {
    var icon = require('./server/routes/icon.js');
}

var app = express();

// Choose session store. Default is built-in memory store (which isn't really
// production ready, but we have a loose definition of 'production').
var sessionStore;
if (nconf.get('sessionStore') === 'mongo') {
    var MongoStore = require('connect-mongo')(express);
    sessionStore = new MongoStore({
        url: nconf.get('databaseUrl'),
        stringify: false    // Not stringifying makes things easier to debug in the mongo shell
    });
}

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
        store: sessionStore
    }));
app.use(app.router);

// Use optimised client files in production environment.
var publicDir = ('development' === app.get('env')) ? 'public' : 'public-opt';
app.use(express.static(path.join(__dirname, publicDir)));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// Wake-on-lan handler.
app.post('/api/wol/:mac', wol.post);

// Onkyo control handler.
app.post('/api/onkyo/:command', onkyo.post);

// User stuff.
userRoutes.addRoutes(app);

// Icon image generator.
if (icon) {
    app.get('/api/icon', icon.get);
}

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
