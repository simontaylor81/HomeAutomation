// Controller for the media centre power on/off widget.
define(['lib/status-common'], function (statusCommon) {

    function powerOn(params) {
        // Send WOL request to the server.
        $.ajax({
            url: '/api/wol/' + params.mac,
            type: 'POST',
            error: function (xhr, status, error) {
                alert('Failed to send WOL request: ' + status);
            }
        });
    }
    function powerOff(params) {
        // Post request to media centre to go to sleep.
        $.ajax({
            url: params.url + '/api/sleep',
            type: 'POST',
            error: function (xhr, status, error) {
                alert('Failed to send sleep request: ' + status);
            }
        });
    }

    function isMediaCentreAlive(params, callback) {
        $.ajax({
            url: params.url + '/api/isalive',
            timeout: 1000,      // Short one second timeout -- it's a local network.
            cache: false,       // No caching
            success: function (data) {
                callback(true);
            },
            error: function (xhr, status, error) {
                callback(false);
            }
        });
    }

    function updateMediaCentreStatus(params, setStatus) {
        isMediaCentreAlive(params, function (isAlive) {
            setStatus(isAlive ? 'On' : 'Off');
        });
    }

    // Return widget object.
    return {
        // Widget initialisation function
        init: function (name, params, widgets) {

            function setStatus(status) {
                widgets.forEach(function (w) {
                    if (w.setStatus) { w.setStatus(status); }
                });
            }
    
            function doPowerAction(actionParams) {
                if (actionParams === 'On') {
                    powerOn(params);
                } else if (actionParams === 'Off') {
                    powerOff(params);
                }
            }

            // Register for power actions.
            widgets.forEach(function (w) {
                w.on('power', doPowerAction);
            });

            // Start with pending status.
            setStatus('Pending');

            // Update status immediately, and every second.
            updateMediaCentreStatus(params, setStatus);
            setInterval(function(){ updateMediaCentreStatus(params, setStatus); }, 1000);
        }
    };
});
