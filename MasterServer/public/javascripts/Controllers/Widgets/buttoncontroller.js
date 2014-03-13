// Controller for button widgets.
define(function () {
    // Constructor.
    function ButtonController(data) {
        this.data = data;
        this.device = data.device || null;
        this.eventCallbacks = {};
    }


    // Initialise the widget.
    ButtonController.prototype.init = function (node) {
        this.node = node;
        this.buttonNode = node.children('button');

        // For non-power actions, fire the an event for the action on click.
        if (this.data.action !== 'power') {
            var self = this;
            this.buttonNode.on('click', function () {
                // No params.
                self.fireEvent(self.data.action, self.data.param);
            });
        }
    };

    // Register for events.
    ButtonController.prototype.on = function (event, callback) {
        // Register for action events.
        if (event === this.data.action) {
            if (!this.eventCallbacks[event]) { this.eventCallbacks[event] = []; }
            this.eventCallbacks[event].push(callback);
        }
    };

    ButtonController.prototype.fireEvent = function (event, params) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(function (c) { c(params); });
        }
    };

    // Buttons can represent a power status by changing their style.
    ButtonController.prototype.setStatus = function (status) {
        if (this.data.action === 'power')
        {
            // Set 'on' class based on status.
            this.buttonNode.toggleClass('ha-on', status === 'On');

            // Set button text to reflect the action.
            var buttonText = {
                On: 'Turn Off',
                Off: 'Turn On',
                Pending: 'Pending'
            }[status];
            this.node.find('.ha-button-text').html(buttonText);

            var self = this;
            var clickAction =
            {
                On: function () { self.fireEvent('power', 'Off'); },
                Off: function () { self.fireEvent('power', 'On'); },
            }[status];

            // Set click function to appropriate action.
            this.buttonNode
                .off('click')
                .on('click', clickAction)
                .prop('disabled', status === 'Pending');
        }
    };

    // Get the customisable settings for this widget type.
    ButtonController.prototype.getCustomisableProperties = function () {
        return [
            {
                property: 'device',
                type: 'text',
                friendly: 'Device'
            },
            {
                property: 'caption',
                type: 'text',
                friendly: 'Caption'
            },
            {
                property: 'icon',
                type: 'text',
                friendly: 'Icon'
            },
            {
                property: 'action',
                type: 'text',
                friendly: 'Action'
            },
            {
                property: 'param',
                type: 'text',
                friendly: 'Parameter'
            }
        ];
    };

    // Module object is the contructor function.
    return ButtonController;
});
