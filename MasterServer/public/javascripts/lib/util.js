define(function () {

    // Add some polyfills.
    Array.prototype.find = Array.prototype.find || function(callback, thisArg) {
        var i;
        for (i = 0; i < this.length; i++) {
            if (callback.call(thisArg, this[i], i, this)) {
                return this[i];
            }
        }
        return undefined;
    };

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