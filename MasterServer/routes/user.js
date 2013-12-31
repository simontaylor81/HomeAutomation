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
function userSession(req, res, next) {
    if (req.session.username) {
        //console.log('Getting account');
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
        //console.log('Logging in (auto)');
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
function postLogin(req, res) {
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
function postLogout(req, res) {
    // Clear session.
    req.session.destroy();

    // Clear auto login cookie.
    res.clearCookie('login');

    res.send(204);
}

// Require that a user is logged in. Sends 403 if not.
// Must have already called userSession.
function requireLogin(req, res, next) {
    if (!req.user) {
        // Not logged in -- client should show login screen.
        res.send(403);
    } else {
        next();
    }
}

// GET /user/widgets
function getWidgets(req, res) {
    // Send the user's widget list.
    res.send(req.user.widgets || []);
};


// Add user-related routes to the app.
exports.addRoutes = function (app) {
    app.post('/user/login', postLogin);
    app.post('/user/logout', postLogout);
    app.get('/user/widgets', userSession, requireLogin, getWidgets);
}