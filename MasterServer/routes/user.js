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
            next();
        });
    } else if (req.signedCookies.login) {
        // Attempt automatic login.
        accountProvider.login(req.signedCookies.login.username, req.signedCookies.login.password)
        .then(
            function (user) {
                // Auto login successful.
                req.user = user;
                req.session.username = user.username;
                next();
            },
            function (reason) {
                // Auto login failed.
                res.clearCookie('login');
                req.session.destroy();
                next();
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

            // If the user want's to, store credentials in a cookie.
            if (req.body.rememberMe) {
                res.cookie(
                    'login',
                    {username: req.body.username, password: req.body.password},
                    {
                        maxAge: 60000 * 60 * 24 * 60,       // 2 month lifetime
                        signed: true
                    });
            }

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
