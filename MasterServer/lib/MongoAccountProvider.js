// Provider for user account stuff that stores account in MongoDB.

var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var q = require('q');
var nconf = require('nconf');

var MongoAccountProvider = exports.MongoAccountProvider = function () {
    var self = this;

    q.nfcall(MongoClient.connect, nconf.get('databaseUrl'))
    .done(function (db) {
        self.collection = db.collection('users');
    });
};

// Login an existing user and return the user object.
MongoAccountProvider.prototype.login = function (username, password) {
    // ID is lower-case username.
    return q.ninvoke(this.collection, 'findOne', {_id: username.toLowerCase()})
    .then(
    function (user) {
        if (!user) {
            throw new Error('Unknown user');
        } else if (!authenticate(user, password)) {
            throw new Error('Incorrect password');
        } else {
            return user;
        }
    });
}

// Create a new account.
MongoAccountProvider.prototype.newAccount = function (username, password) {
    var self = this;

    // Add the new user.
    return q.ninvoke(self.collection, 'insert', {
        _id: username.toLowerCase(),
        username: username,
        password: hashPassword(password)
    })
    .then(
        function (documents) {
            // Array of documents is returned, we just want the first one.
            return documents[0];
        },
        function (reason) {
            // E11000 = duplicate key, i.e. account already exists.
            if (reason.code === 11000) {
                throw new Error("Username '" + username + "' already exists.");
            }
            throw reason;
        });
        //});
}

// Simple account accessor, assuming already authenticated.
MongoAccountProvider.prototype.getAccount = function (id) {
    return q.ninvoke(this.collection, 'findOne', {_id: id});
}

// Save a user's account details back to the database.
MongoAccountProvider.prototype.saveAccount = function (user) {
    return q.ninvoke(this.collection, 'save', user);
};



// Check a user's password.
function authenticate(user, password) {
    // TODO: Hash
    return user.password === password;
}

// Hash a password for storage.
function hashPassword(password) {
    // TODO:
    return password;
}
