// Controller for group widgets.
define(function () {
    // Constructor.
    function GroupController(data) {
        this.data = data;
        this.device = data.device || null;
    }

    // Initialise the widget.
    GroupController.prototype.init = function (node) {
        this.node = node;
        this.panelNode = node.children('.ha-panel');
    };

    // Register for events.
    GroupController.prototype.on = function (event, callback) {
        // Groups don't have any events.
    };

    // Groups can represent a status by changing their colour & title.
    GroupController.prototype.setStatus = function (status) {
        var classes = {
            On: 'ha-green',
            Off: 'ha-red',
            Pending: 'ha-amber',
        };

        // Set class of panels.
        this.panelNode.removeClass('ha-green ha-red ha-amber').addClass(classes[status]);

        // Set status text.
        this.node.find('.ha-status-text').html(status);
    };

    // Get the customisable settings for this widget type.
    GroupController.prototype.getCustomisableProperties = function () {
        return [
            {
                property: 'caption',
                type: 'text',
                friendly: 'Caption'
            },
            {
                property: 'status',
                type: 'bool',
                friendly: 'Show Status'
            }
        ];
    };

    // Can widgets of this type have sub-widgets?
    GroupController.prototype.canHaveChildren = true;

    // Module object is the contructor function.
    return GroupController;
});
