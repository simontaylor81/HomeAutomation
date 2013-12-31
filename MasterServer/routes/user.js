// User-related routes.

var MemoryAccountProvider = require('../lib/MemoryAccountProvider').MemoryAccountProvider;
var MongoAccountProvider = require('../lib/MongoAccountProvider').MongoAccountProvider;

// Create dummy memory account provider.
var accountProvider = new MongoAccountProvider();
//var accountProvider = new MemoryAccountProvider();

// Add a dummy account.
//accountProvider.newAccount('simon', 'pass')
//.done(function (user) {
//    // Give the dummy account some dummy widgets.
//    user.widgets = require('../public/test/controllist.json');
//});


// Middleware for handling user sessions.
function userSession(req, res, next) {
    if (req.session.userid) {
        //console.log('Getting account');
        accountProvider.getAccount(req.session.userid)
        .done(function (user) {
            if (!user) {
                // Could not find account -- deleted?
                req.session.destroy();
            }

            req.user = user;
            next();
        });
    } else if (req.signedCookies.login) {
        // Attempt automatic login.
        //console.log('Logging in (auto)');
        accountProvider.login(req.signedCookies.login.username, req.signedCookies.login.password)
        .done(
            function (user) {
                // Auto login successful.
                req.user = user;
                req.session.userid = user._id;
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
}


// POST /user/login
function postLogin(req, res) {
    // Need a username and a password.
    if (!req.body.username || !req.body.password) {
        res.send(400);
    }

    // Attempt login.
    accountProvider.login(req.body.username, req.body.password)
    .done(
        function (user) {
            // Save user id in session.
            req.session.userid = user._id;

            // If the user want's to, store credentials in a cookie.
            if (req.body.rememberMe) {
                res.cookie(
                    'login',
                    {
                        username: req.body.username,
                        password: req.body.password
                    },
                    {
                        maxAge: 60000 * 60 * 24 * 60,       // 2 month lifetime
                        signed: true
                    });
            }

            res.send(204);
        },
        function (reason) {
            // Invalid user -- send 'Forbidden'.
            res.send(403, reason.message)
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

// POST /user/createaccount
function postCreateAccount(req, res) {
    // Need a username and a password.
    if (!req.body.username || !req.body.password) {
        res.send(400);
    }

    accountProvider.newAccount(req.body.username, req.body.password)
    .done(
        function (newUser) {
            // Save user id in session.
            req.session.userid = newUser._id;

            res.send(204);
        },
        function (reason) {
            // Failed to create account.
            res.send(400, reason.message);
        });
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
// Get the user's widget config.
function getWidgets(req, res) {
    // Send the user's widget list.
    res.send(req.user.widgets || []);
}

// POST /user/widgets
// Save the user's widget config.
function postWidgets(req, res) {
    if (!(req.body instanceof Array)) {
        res.send(400, 'Expected: widget list');
    }

    req.user.widgets = req.body;
    accountProvider.saveAccount(req.user)
    .done(function () { res.send(204); });
}


// Add user-related routes to the app.
exports.addRoutes = function (app) {
    app.post('/user/login', postLogin);
    app.post('/user/logout', postLogout);
    app.post('/user/createAccount', postCreateAccount);

    app.get('/user/widgets', userSession, requireLogin, getWidgets);
    app.post('/user/widgets', userSession, requireLogin, postWidgets);
}