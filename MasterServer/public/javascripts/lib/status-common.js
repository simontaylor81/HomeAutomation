// Common status handling code.
define({
    // Filter the given list of widgets to find only status panels.
    findStatusPanels: function (widgets) {
        return widgets.children('.ha-panel-status');
    },

    // Filter the given list of widgets to find only power buttons.
    findPowerButtons: function (widgets) {
        return widgets.children('.ha-btn-power');
    },

    // Update a panel to reflect the new status.
    setPanelStatus: function (status, panels) {
        classes = {
            On: 'ha-green',
            Off: 'ha-red',
            Pending: 'ha-amber',
        };

        // Set class of panels.
        panels.removeClass('ha-green ha-red ha-amber').addClass(classes[status]);

        // Set status text.
        panels.find('.ha-status-text').html(status);
    },

    // Update power buttons to reflect a new status.
    setPowerButtonStatus: function (status, buttons, actions) {
        // Set 'on' class based on status.
        buttons.toggleClass('ha-on', status === 'On');

        // Set button text to reflect the action.
        var buttonText = {
            On: 'Turn Off',
            Off: 'Turn On',
            Pending: 'Pending'
        }[status];
        buttons.find('.ha-button-text').html(buttonText);

        // Set click function to appropriate action.
        buttons
            .off('click')
            .on('click', actions[status])
            .prop('disabled', status === 'Pending');
    },

    setStatus: function (status, container, actions) {
        // Find panel in container.
        var panel = container.children('.panel');

        classes = {
            On: 'ha-green',
            Off: 'ha-red',
            Pending: 'ha-amber',
        };
        var panelClass = classes[status];

        // Set class of panel.
        panel.removeClass('ha-green ha-red ha-amber').addClass(panelClass);

        // Set status text.
        panel.find('.ha-status-text').html(status);

        // Set state of buttons in the panel.
        var buttons = panel.find('.ha-btn-power');
        if (status === 'On') {
            buttons.addClass('ha-on');
        } else {
            buttons.removeClass('ha-on');
        }

        var buttonText = {
            On: 'Turn Off',
            Off: 'Turn On',
            Pending: 'Pending'
        }[status];
        buttons.find('.ha-button-text').html(buttonText);

        // Set click function to appropriate action.
        buttons
            .off('click')
            .on('click', actions[status])
            .prop('disabled', status === 'Pending');
    }
});
