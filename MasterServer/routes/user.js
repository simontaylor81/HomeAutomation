// User-related routes.

var MemoryAccountProvider = require('../lib/MemoryAccountProvider').MemoryAccountProvider;

// Create dummy memory account provider.
var accountProvider = new MemoryAccountProvider();

// Add a dummy account.
accountProvider.newAccount('simon', 'pass');

// POST /user/login
exports.postLogin = function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.send(400);
    }

    // Attempt login.
    accountProvider.login(req.body.username, req.body.password)
    .then(
        function (user) {
            // Save user in session.
            req.session.user = user;
            res.send(204);
        },
        function (reason) {
            // Invalid user -- send 'Forbidden'.
            res.send(403)
        });
}

// GET /user/widgets
exports.getWidgets = function (req, res) {
    var data = "First time";
    if (req.session.beenHere === 'yes') {
        data = "Been here before";
    } else {
        req.session.beenHere = 'yes';
    }
    res.send({key1: 'value1', key2: 'value2', session: data});
};
