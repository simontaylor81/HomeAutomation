// Code for handling the XMBC status control.

controlInitFunctions.xbmc = function (params, div) {
    // Save container element in the params object to save passing two things everywhere.
    params.container = div;

    setXbmcStatus(params, 'Pending');
    updateXbmcStatus(params);
    setInterval(function(){ updateXbmcStatus(params); }, 2000);
}


function setXbmcStatus(params, status) {
    setStatus(status, params.container, {
        On: function() { closeXbmc(params); },
        Off: function() { startXbmc(params); }
    });
}

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
            //appendLog(JSON.stringify(result));
            callback(true);
        },
        function (error) {
            //error && appendLog(JSON.stringify(error));
            callback(false);
        });
}

function updateXbmcStatus(params) {
    isXmbcAlive(params, function (isAlive) {
        //appendLog(isAlive ? "XBMC Alive" : "XBMC Dead");
        setXbmcStatus(params, isAlive ? 'On' : 'Off');
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
