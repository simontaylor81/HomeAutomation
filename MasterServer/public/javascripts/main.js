var serverName = "alfred";
var mediaCentreAddress = "192.168.0.150";
var mediaCentreServerUrl = "http://" + mediaCentreAddress + ":55343";

// Use proxy to avoid CORS issues.
var xbmcUrl = mediaCentreServerUrl + "/api/xbmcjsonrpc";

// Disable caching of ajax requests.
$.ajaxSetup({ cache: true });

$(document).ready(function(){
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
    setStatus(status, '#power-panel', {
        On: turnOff,
        Off: turnOn
    });
}
function setXbmcStatus(status) {
    setStatus(status, '#xbmc-panel', {
        On: closeXbmc,
        Off: startXbmc
    });
}

function setStatus(status, panelSelector, actions) {
    classes = {
        On: 'ha-green',
        Off: 'ha-red',
        Pending: 'ha-amber',
    };
    var panelClass = classes[status];

    // Set class of panel.
    var panel = $(panelSelector);
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

// Quick testing.
var statusCycle = 0;
function testStatus() {
    var status = ['Off', 'On', 'Pending'][statusCycle];
    setPowerStatus(status);
    statusCycle = (statusCycle + 1) % 3;
}

function testOnOff() {
    $('.ha-btn-power').toggleClass('ha-on');

    var panel = $('#power-panel');
    var newClass = panel.hasClass('ha-green') ? 'ha-red' : 'ha-green';
    panel.removeClass('ha-green ha-red').addClass(newClass);
}

// Add a log message.
function appendLog(str) {
    $('#log').append(str + '<br>');
}
