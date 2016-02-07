// Provider for user account stuff that stores data in a json file.
// This is a very simple naive implementation. It will not work with multiple running
// processes, or if anything else is modifying the file concurrently.
// It also does very little validation.

var fs = require('fs');
var path = require('path');
var q = require('q');
var nconf = require('nconf');
var mkdirp = require('mkdirp');
var pwd = require('pwd');

var filename = nconf.get('databaseFile');

// Put in AppData on Windows to avoid cluttering home dir
var homeDir = process.platform === 'win32' ? process.env.APPDATA : process.env.HOME
filename = filename.replace('~',  homeDir);

var FileAccountProvider = exports.FileAccountProvider = function () {
    console.log('Loading user data from ' + filename);
    this.data = load() || {};
    this.data.users = this.data.users || [];
};

// Define array find method that's not in V8 yet.
if (Array.prototype.find === undefined) {
    Array.prototype.find = function (callback, thisObject) {
        var i, element;
        for (i = 0; i < this.length; i++) {
            element = this[i];
            if (thisObject !== undefined) {
                if (thisObject.callback(element, i, this))
                    return element;
            } else {
                if (callback(element, i, this))
                    return element;
            }
        }

        // Not found.
        return undefined;
    }
}

// Login an existing user and return the user object.
FileAccountProvider.prototype.login = function (username, password) {
    // Find user with this username. ID is lower-case username
    var user = findUser(this.data.users, username.toLowerCase());
    if (!user) {
        return q.reject(new Error('Unknown user'));
    }

    // Authenticate password hash.
    return q.nfcall(pwd.hash, password, user.passwordSalt)
    .then(function (hash) {
        if (hash !== user.passwordHash) {
            throw new Error('Incorrect password');
        }
        return user;
    });
}

// Create a new account.
FileAccountProvider.prototype.newAccount = function (username, password) {
    var self = this;

    // Check that we don't already have a user with that name.
    if (findUser(this.data.users, username.toLowerCase())) {
        return q.reject("Username '" + username + "' already exists.");
    }

    // Generate password hash and salt for the user.
    return q.nfcall(pwd.hash, password)
    .then(function (result) {
        var newUser = {
            _id: username.toLowerCase(),
            username: username,
            passwordSalt: result[0],
            passwordHash: result[1]
        };
        
        // Add a new user object to the array.
        self.data.users.push(newUser);
        
        // Save.
        return save(self.data)
        .then(function () { return newUser; });
    });
}

// Simple account accessor, assuming already authenticated.
FileAccountProvider.prototype.getAccount = function (id) {
    return q(findUser(this.data.users, id) || null);
}

// Save the account. Nothing to do since we just pass a reference to the raw object.
FileAccountProvider.prototype.saveAccount = function (user) {
    // TODO: Replace with modified version.
    return save(this.data);
};

// Helper for searching finding a user with the given id. Returns undefined if not found.
function findUser(users, id) {
    // TODO: Clone
    return users.find(function (user) { return user._id == id; });
}

// Load data from the file (synchronous, as we only do this at startup).
function load() {
    if (fs.existsSync(filename)) {
        // Probably could use some validation here...
        return JSON.parse(fs.readFileSync(filename));
    }
}

// Save everything to the file.
function save(data) {
    
    // Ensure directories are created.
    var dir = path.dirname(filename);
    return q.nfcall(mkdirp, dir)
    .then(function () {
        // Write file contents.
        var json = JSON.stringify(data);
        return q.nfcall(fs.writeFile, filename, json);
    });
}
