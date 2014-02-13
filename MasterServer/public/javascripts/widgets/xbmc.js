// Code for handling the XMBC status control.
define(function () {

    // Return widget object.
    return {
        // Widget initialisation function
        init: function (name, params, widgets) {

            function xbmcRpc(method, success, failure) {
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
            function isXmbcAlive(callback) {
                // Send JSONRPC ping request.
                xbmcRpc('JSONRPC.Ping',
                    function (result) {
                        callback(true);
                    },
                    function (error) {
                        callback(false);
                    });
            }

            function updateXbmcStatus(setStatus) {
                isXmbcAlive(function (isAlive) {
                    setStatus(isAlive ? 'On' : 'Off');
                });
            }

            function closeXbmc() {
                xbmcRpc('Application.Quit');
            }

            function startXbmc() {
                $.ajax({
                    url: params.url + '/api/run?path=' + params.xbmcPath,
                    type: 'POST'
                });
            }

            function setStatus(status) {
                widgets.forEach(function (w) {
                    if (w.setStatus) { w.setStatus(status); }
                });
            }

            function killXbmc() {
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

            function doPowerAction(actionParams) {
                if (actionParams === 'On') {
                    startXbmc();
                } else if (actionParams === 'Off') {
                    closeXbmc();
                }
            }

            // Register for power actions.
            widgets.forEach(function (w) {
                w.on('power', doPowerAction);
            });

            // Register for kill actions.
            widgets.forEach(function (w) {
                w.on('killXbmc', killXbmc);
            });

            // Start with pending status.
            setStatus('Pending');

            // Update status immediately, and every second.
            updateXbmcStatus(setStatus);
            setInterval(function(){ updateXbmcStatus(setStatus); }, 1000);
        }
    };
});
