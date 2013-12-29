// Provider for user account stuff that just stores stuff in memory.

var q = require('q');

var MemoryAccountProvider = exports.MemoryAccountProvider = function () {
    this.users = [];
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

// Return a function for matching account usernames.
function makeUserMatcher(username) {
    // Usernames are case-insensitive.
    var usernameLower = username.toLowerCase();

    return function (user) {
        return user.username.toLowerCase() == usernameLower;
    }
}

// Login an existing number and return the user object.
MemoryAccountProvider.prototype.login = function (username, password) {
    // Find user with this username.
    var user = this.users.find(makeUserMatcher(username));

    // Check the password matches.
    if (user && user.password === password) {
        return q(user);
    }
    
    return q.reject('Login failed');
}

// Create a new account.
MemoryAccountProvider.prototype.newAccount = function (username, password) {
    // Check that we don't already have a user with that name.
    if (this.users.find(makeUserMatcher(username))) {
        return q.reject("Username '" + username + "' already exists.");
    }

    // Add a new user object to the array.
    var newUser = {username: username, password: password};
    this.users.push(newUser);
    return q(newUser);
}

// Simple account accessor, assuming already authenticated.
MemoryAccountProvider.prototype.getAccount = function (username) {
    var user = this.users.find(makeUserMatcher(username));
    if (user) {
        return q(user);
    }
    return q.reject('User not found.');
}
