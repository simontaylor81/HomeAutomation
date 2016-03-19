// Controller for text widgets.
define(['core/event'], function (Event) {
    // Constructor.
    function TextController(data) {
        this.data = data;
        this.device = data.device || null;
        this.event = new Event();
    }


    // Initialise the widget.
    TextController.prototype.init = function (node) {
        this.node = node;

        var button = $('button', node);
        var text = $('input', node);

        // Fire an event for the action on clicking the Go button.
        var self = this;
        button.on('click', function () {
            // parameter is the contents of the textbox.
            self.event.fire(text.val());
        });
    };

    // Register for events.
    TextController.prototype.on = function (event, callback) {
        // We only have one event.
        if (event === this.data.action) {
            this.event.subscribe(callback);
        }
    };

    // Get the customisable settings for this widget type.
    TextController.prototype.getCustomisableProperties = function (deviceData) {
        var props = [
            {
                property: 'device',
                type: 'enum',
                enumType: 'device',
                friendly: 'Device'
            },
            {
                property: 'initialText',
                type: 'text',
                friendly: 'Initial Text'
            }
        ];
        
        if (this.device && deviceData[this.device]) {
            var deviceType = deviceData[this.device].type;
            
            // Add action property with the appropriate enum for the device type.
            props.push({
                property: 'action',
                type: 'enum',
                enumType: 'action-' + deviceType,
                friendly: 'Action'
            });
        }

        return props;
  };

    // Can widgets of this type have sub-widgets?
    TextController.prototype.canHaveChildren = false;

    // Module object is the contructor function.
    return TextController;
});
