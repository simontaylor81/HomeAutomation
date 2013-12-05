
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var wol = require('wake_on_lan');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// Wake-on-lan handler.
app.post('/api/wol/:mac', function(req, res) {
    console.log('wol: ' + req.params.mac);
    try {
        wol.wake(req.params.mac, {}, function(err) {
            if (err) {
                console.log('WOL failed: ' + err.message);
                res.send(500, err.message);
            } else {
                res.send(200);
            }
        });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
