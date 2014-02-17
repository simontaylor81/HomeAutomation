define(function () {
    return {
        // Wrap an event handler to prevent the default behaviour (e.g. follow link). 
        preventDefaultEvent: function (handler) {
            return function (event) {
                event.preventDefault();
                handler.call(this, event);
            }
        }

    };
});