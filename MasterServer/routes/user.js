// User-related routes.

var MemoryAccountProvider = require('../lib/MemoryAccountProvider').MemoryAccountProvider;

// Create dummy memory account provider.
var accountProvider = new MemoryAccountProvider();

// Add a dummy account.
accountProvider.newAccount('simon', 'pass')
.then(function (user) {
    // Give the dummy account some dummy widgets.
    user.widgets = require('../public/test/controllist.json');
});


// Middleware for handling user sessions.
exports.userSession = function (req, res, next) {
    if (req.session.username) {
        accountProvider.getAccount(req.session.username)
        .then(function (user) {
            req.user = user;
            next();
        }, function (reason) {
            // Could not find account -- deleted?
            req.session.destroy();
        });
    } else {
        next();
    }
};


// POST /user/login
exports.postLogin = function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.send(400);
    }

    // Attempt login.
    accountProvider.login(req.body.username, req.body.password)
    .then(
        function (user) {
            // Save username in session.
            req.session.username = user.username;
            res.send(204);
        },
        function (reason) {
            // Invalid user -- send 'Forbidden'.
            res.send(403)
        });
}

// POST /user/logout
// Clears user session data.
exports.postLogout = function (req, res) {
    // Clear session.
    req.session.destroy();
    res.send(204);
}

// GET /user/widgets
exports.getWidgets = function (req, res) {
    // Are we logged in?
    if (req.user) {
        // Send the user's widget list.
        res.send(req.user.widgets || []);
    } else {
        // Not logged in -- client should show login screen.
        res.send(403);
    }
};
