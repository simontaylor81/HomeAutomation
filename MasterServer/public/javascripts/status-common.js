// Common status handling code.

function setStatus(status, container, actions) {
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
    var buttons = panel.find('button');
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
