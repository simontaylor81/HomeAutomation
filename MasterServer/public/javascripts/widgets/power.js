// Controller for the media centre power on/off widget.
define(function () {

    var intervalHandle;

    // Return module object.
    return {
        // Device initialisation function
        init: function (name, params, widgets) {

            function powerOn() {
                // Send WOL request to the server.
                $.ajax({
                    url: '/api/wol/' + params.mac,
                    type: 'POST',
                    error: function (xhr, status, error) {
                        alert('Failed to send WOL request: ' + status);
                    }
                });
            }
            function powerOff() {
                // Post request to media centre to go to sleep.
                $.ajax({
                    url: params.url + '/api/sleep',
                    type: 'POST',
                    error: function (xhr, status, error) {
                        alert('Failed to send sleep request: ' + status);
                    }
                });
            }

            function isMediaCentreAlive(callback) {
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

            function updateMediaCentreStatus(setStatus) {
                isMediaCentreAlive(function (isAlive) {
                    setStatus(isAlive ? 'On' : 'Off');
                });
            }

            function setStatus(status) {
                widgets.forEach(function (w) {
                    if (w.setStatus) { w.setStatus(status); }
                });
            }
    
            function doPowerAction(actionParams) {
                if (actionParams === 'On') {
                    powerOn();
                } else if (actionParams === 'Off') {
                    powerOff();
                }
            }

            function doLaunchAction(path) {
                alert(path);
                $.ajax({
                    url: params.url + '/api/run?path=' + path,
                    type: 'POST'
                });
            }

            widgets.forEach(function (w) {
                // Register for power actions.
                w.on('power', doPowerAction);

                // Register for launch actions.
                w.on('launch', doLaunchAction);
            });

            // Start with pending status.
            setStatus('Pending');

            // Update status immediately, and every second.
            updateMediaCentreStatus(setStatus);
            intervalHandle = setInterval(function(){ updateMediaCentreStatus(setStatus); }, 1000);
        },
        dispose: function () {
            if (intervalHandle !== undefined) {
                clearInterval(intervalHandle);
            }
        },

        getCustomisableProperties: function () {
            return [
                {
                    property: 'url',
                    type: 'text',
                    friendly: 'URL'
                },
                {
                    property: 'mac',
                    type: 'text',
                    friendly: 'MAC'
                }
            ];
        }
    };
});
