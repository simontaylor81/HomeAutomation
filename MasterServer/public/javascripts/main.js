var serverName = "alfred";
var mediaCentreAddress = "192.168.0.150";
var mediaCentreServerUrl = "http://" + mediaCentreAddress + ":55343";

// Use proxy to avoid CORS issues.
var xbmcUrl = mediaCentreServerUrl + "/api/xbmcjsonrpc";

// Disable caching of ajax requests.
$.ajaxSetup({ cache: true });

$(document).bind('pageinit', function () {
    // Set server name in header.
    $('#serverName').html(serverName);

    // Set both statuses to pending.
    setPowerStatus('Pending');
    setXbmcStatus('Pending');

    // Update statuses immediately.
    updateMediaCentreStatus();
    updateXbmcStatus();

    // Set up a time to update periodically.
    setInterval(updateMediaCentreStatus, 1000);
    setInterval(updateXbmcStatus, 2000);
});

function setPowerStatus(status) {
    setStatus(status, 'Power', '#powerButton', turnOn, turnOff, true);
}
function setXbmcStatus(status) {
    setStatus(status, 'XBMC', '#xbmcButton', startXbmc, closeXbmc, false);
}

function setStatus(status, prefix, buttonId, onFunction, offFunction, setHeader) {
    // Set header theme.
    themes = {
        On: 'f',
        Off: 'g',
        Pending: 'h'
    };
    var theme = themes[status];

    // Set on-off button to do the right thing.
    var button = $(buttonId);
    var text = prefix + ': ' + status;
    var disabled = false;
    var onClick = false;

    switch (status) {
        case 'Off':
            onClick = onFunction;
            break;

        case 'On':
            onClick = offFunction;
            break;

        case 'Pending':
            disabled = true;      // Disable if we're pending.
            break;
    }

    // Workaround for jqm bug: set data-theme on button wrapper div too.
    button.parent().attr('data-theme', theme);

    button
        .html(text)
        .off('click')
        .on('click', onClick)
        .attr('data-theme', theme)
        .buttonMarkup({ theme: theme })
        .button(disabled ? 'disable' : 'enable')
        .button('refresh')
    ;

    // Set status text in header.
    if (setHeader) {
        setTheme($("#header"), 'bar', theme);
    }
}

function turnOn() {
    // The media centre's MAC address.
    var mac = '00-23-AE-03-EE-55';

    // Send WOL request to the server.
    $.ajax({
        url: '/api/wol/' + mac,
        type: 'POST',
        success: function (data) {
            //appendLog('WOL sent: ' + data);
        },
        error: function (xhr, status, error) {
            alert('Failed to send WOL request: ' + status);
        }
    });
}
function turnOff() {
    // Post request to media centre to go to sleep.
    $.ajax({
        url: mediaCentreServerUrl + '/api/sleep',
        type: 'POST',
        success: function () {
            //appendLog('Sleep request sent');
        },
        error: function (xhr, status, error) {
            alert('Failed to send sleep request: ' + status);
        }
    });
}

function isMediaCentreAlive(callback) {
    $.ajax({
        url: mediaCentreServerUrl + '/api/isalive',
        timeout: 1000,      // Short one second timeout -- it's a local network.
        success: function (data) {
            callback(true);
        },
        error: function (xhr, status, error) {
            //alert('status: ' + status + '\n' + 'error: ' + error);
            callback(false);
        }
    });
}

function updateMediaCentreStatus() {
    //appendLog('Checking status...');
    isMediaCentreAlive(function (isAlive) {
        //appendLog(isAlive ? "Alive" : "Dead");
        setPowerStatus(isAlive ? 'On' : 'Off');
    });
}

function xbmcRpc(method, success, failure) {
    var rpcid = 'HomeAutomationXBMC';

    // Send request to proxy (to bypass CORS issues).
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
            //appendLog(JSON.stringify(result));
            callback(true);
        },
        function (error) {
            //error && appendLog(JSON.stringify(error));
            callback(false);
        });
}

function updateXbmcStatus() {
    isXmbcAlive(function (isAlive) {
        //appendLog(isAlive ? "XBMC Alive" : "XBMC Dead");
        setXbmcStatus(isAlive ? 'On' : 'Off');
    });
}

function closeXbmc() {
    xbmcRpc('Application.Quit');
}

function startXbmc() {
    var xbmcPath = 'C:\\Program Files (x86)\\XBMC\\XBMC.exe';
    $.ajax({
        url: mediaCentreServerUrl + '/api/run?path=' + xbmcPath,
        type: 'POST'
    });
}

// Helper for setting theme on things that don't expose the required methods.
function setTheme(elem, type, theme) {
    // Remove existing theme classes.
    elem.removeClass(function (index, prevClass) {
        var allClasses = prevClass.split(' ');
        var toRemove = allClasses.filter(function (c) { return c.indexOf('ui-' + type + '-') >= 0; });
        return toRemove.join(' ');
    });

    // Add the new class.
    elem.addClass('ui-' + type + '-' + theme);
}

// Quick testing.
var statusCycle = 0;
function testStatus() {
    var status = ['Off', 'On', 'Pending'][statusCycle];
    setPowerStatus(status);
    statusCycle = (statusCycle + 1) % 3;
}

// Add a log message.
function appendLog(str) {
    $('#log').append(str + '<br>');
}
