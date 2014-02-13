// Code for handling the XMBC status control.
define(['lib/status-common'], function (statusCommon) {

    function xbmcRpc(params, method, success, failure) {
        var rpcid = 'HomeAutomationXBMC';

        // Send request to proxy (to bypass CORS issues).
        var xbmcUrl = params.url + "/api/xbmcjsonrpc";
        $.ajax({
            url: xbmcUrl,
            timeout: 2000,      // Give it a bit longer to cope with proxy delay.
            contentType: 'application/json',
            data: JSON.stringify({
                jsonrpc: '2.0',
                method: method,
                id: rpcid
            }),
            type: 'POST',
            success: function (data) {
                // id must match the one we gave it, and there should be a valid result.
                if (data.id === rpcid && data.result) {
                    success && success(data.result);
                } else {
                    failure && failure(data.error);
                }
            },
            error: function (xhr, status, error) {
                failure && failure();
            }
        });
    }

    // Get the status of XBMC.
    function isXmbcAlive(params, callback) {
        // Send JSONRPC ping request.
        xbmcRpc(params, 'JSONRPC.Ping',
            function (result) {
                callback(true);
            },
            function (error) {
                callback(false);
            });
    }

    function updateXbmcStatus(params, setStatus) {
        isXmbcAlive(params, function (isAlive) {
            setStatus(isAlive ? 'On' : 'Off');
        });
    }

    function closeXbmc(params) {
        xbmcRpc(params, 'Application.Quit');
    }

    function startXbmc(params) {
        $.ajax({
            url: params.url + '/api/run?path=' + params.xbmcPath,
            type: 'POST'
        });
    }

    function killXbmc(params) {
        // This is a fairly drastic step, so prompt in case it was hit accidentally.
        if (confirm('This will kill all running XBMC processes. Are you sure?'))
        {
            $.ajax({
                url: params.url + '/api/killprocess?name=xbmc',
                type: 'POST'
            })
            .success(function (data) { alert(data); })
            .fail(function (jqxhr, settings, exception) {
                alert('Failed to kill XMBC: ' + exception);
            });
        }
    }

    // Return widget object.
    return {
        // Widget initialisation function
        init: function (name, params, widgets) {
            // Find the panels and buttons that refer to this device.
            var panels = statusCommon.findStatusPanels(widgets);
            var buttons = statusCommon.findPowerButtons(widgets);

            function setStatus(status) {
                statusCommon.setPanelStatus(status, panels);
                statusCommon.setPowerButtonStatus(status, buttons, {
                    On: function() { closeXbmc(params); },
                    Off: function() { startXbmc(params); }
                });
            }

            // Start with pending status.
            setStatus('Pending');

            // Update status immediately, and every second.
            updateXbmcStatus(params, setStatus);
            setInterval(function(){ updateXbmcStatus(params, setStatus); }, 1000);

            // Register kill button handler.
            // TODO
            //widgetsNode.find('.ha-btn-killProcess').on('click', function () { killXbmc(params); });
        }
    };
});
