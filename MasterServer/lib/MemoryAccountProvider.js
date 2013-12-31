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

// Login an existing user and return the user object.
MemoryAccountProvider.prototype.login = function (username, password) {
    // Find user with this username. ID is lower-case username
    var user = findUser(this.users, username.toLowerCase());

    // Check the password matches.
    if (user && user.password === password) {
        return q(user);
    }
    
    return q.reject('Login failed');
}

// Create a new account.
MemoryAccountProvider.prototype.newAccount = function (username, password) {
    // Check that we don't already have a user with that name.
    if (findUser(this.users, username.toLowerCase())) {
        return q.reject("Username '" + username + "' already exists.");
    }

    // Add a new user object to the array.
    var newUser = {
        _id: username.toLowerCase(),
        username: username,
        password: password
    };
    this.users.push(newUser);
    return q(newUser);
}

// Simple account accessor, assuming already authenticated.
MemoryAccountProvider.prototype.getAccount = function (id) {
    return q(findUser(this.users, id) || null);
}

// Save the account. Nothing to do since we just pass a reference to the raw object.
MemoryAccountProvider.prototype.saveAccount = function (user) {
    return q();
};

// Helper for searching finding a user with the given id. Returns undefined if not found.
function findUser(users, id) {
    return users.find(function (user) { return user._id == id; });
}
