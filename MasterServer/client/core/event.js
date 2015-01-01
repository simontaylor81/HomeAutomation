// A simple event object.
define(function () {

    function Event() {
        this.subscribers = [];
    }

    // Fire the event, calling all subscribers.
    Event.prototype.fire = function () {
        var args = arguments;
        this.subscribers.forEach(function (f) {
            // Forward any passed in args.
            f.apply(null, args);
        });
    };

    // Add a subscriber. Returns function to call to unsubscribe.
    Event.prototype.subscribe = function (fn) {
        // Add function to subscribers array.
        this.subscribers.push(fn);

        // Return unsubscription function.
        var self = this;
        return function () {
            self.subscribers.splice(self.subscribers.indexOf(fn), 1);
        };
    };

    return Event;
});
