define(function () {

    // Add some polyfills & helpers.
    Array.prototype.findIndex = Array.prototype.findIndex || function(callback, thisArg) {
        var i;
        for (i = 0; i < this.length; i++) {
            if (callback.call(thisArg, this[i], i, this)) {
                return i;
            }
        }
        return -1;
    };
    Array.prototype.find = Array.prototype.find || function(callback, thisArg) {
        // Don't call directly so this can be called on array-like objects.
        var index = Array.prototype.findIndex.call(this, callback, thisArg);
        return index >= 0 ? this[index] : undefined;
    };

    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
    if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: function (searchString, position) {
                position = position || 0;
                return this.indexOf(searchString, position) === position;
            }
        });
    }

    Array.prototype.removeItem = function (item) {
        var index = this.indexOf(item);
        if (index >= 0) {
            this.splice(index, 1);
        }
    };

    String.prototype.contains = function (s) {
        return this.indexOf(s) >= 0;
    };

    // Tricks taken from http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string/4579228#4579228
    String.prototype.startsWith = function (s) {
        return this.lastIndexOf(s, 0) >= 0;
    };
    String.prototype.endsWith = function (s) {
        return this.indexOf(s, this.length - s.length) >= 0;
    };

    function nextTick(fn) {
        setTimeout(fn, 0);
    }

    return {
        // Wrap an event handler to prevent the default behaviour (e.g. follow link). 
        preventDefaultEvent: function (handler) {
            return function (event) {
                event.preventDefault();
                handler.call(this, event);
            };
        },

        // Is a variable undefined?
        isUndefined: function (obj) {
            return typeof obj === 'undefined';
        },

        // Perform an operation on the next tick.
        nextTick: nextTick,

        // Return a function that performs an operation on the next tick at most once.
        deferredOperation: function (operation) {
            // Do we need to perform the operation?
            var needsUpdate = false;

            return function () {
                // Mark update as required
                needsUpdate = true;

                // Enqueue function to actually do it.
                nextTick(function () {
                    // Only do it if another invocation hasn't already done so.
                    if (needsUpdate) {
                        needsUpdate = false;
                        operation();
                    }
                });
            }
        },

        // Convert array-like object to an actual array.
        toArray: function (o) {
            return Array.prototype.slice.call(o, 0);
        }
    };
});