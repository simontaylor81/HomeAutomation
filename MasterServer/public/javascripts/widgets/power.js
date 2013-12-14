// Controller for the media centre power on/off widget.
define(['lib/status-common'], function (statusCommon) {

    function setPowerStatus(params, status) {
        statusCommon.setStatus(status, params.container, {
            On: function() { powerOff(params); },
            Off: function() { powerOn(params); }
        });
    }

    function powerOn(params) {
        // Send WOL request to the server.
        $.ajax({
            url: '/api/wol/' + params.mac,
            type: 'POST',
            success: function (data) {
                //appendLog('WOL sent: ' + data);
            },
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
            success: function () {
                //appendLog('Sleep request sent');
            },
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
                //alert('status: ' + status + '\n' + 'error: ' + error);
                callback(false);
            }
        });
    }

    function updateMediaCentreStatus(params) {
        //appendLog('Checking status...');
        isMediaCentreAlive(params, function (isAlive) {
            //appendLog(isAlive ? "Alive" : "Dead");
            setPowerStatus(params, isAlive ? 'On' : 'Off');
        });
    }

    // Return widget object.
    return {
        template: "controltemplate",

        // Widget initialisation function
        init: function (params, div) {
            // Save container element in the params object to save passing two things everywhere.
            params.container = div;

            setPowerStatus(params, 'Pending');
            updateMediaCentreStatus(params);
            setInterval(function(){ updateMediaCentreStatus(params); }, 1000);
        }
    };
});
