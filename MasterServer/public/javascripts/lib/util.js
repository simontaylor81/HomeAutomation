define(function () {

    // Add some polyfills.
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
        var index = this.findIndex(callback, thisArg);
        return index >= 0 ? this[i] : undefined;
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
        }
    };
});