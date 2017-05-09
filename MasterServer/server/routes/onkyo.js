var eiscp = require('eiscp');

var connected = false;
eiscp.on("connect", function () { connected = true; });
eiscp.on("close", function () { connected = false; });

eiscp.connect();

var commands = {
    chromecast: ['system-power=on', 'input-selector=aux1']
};

// Onkyo receiver control handler.
exports.post = function (req, res) {
    if (commands[req.params.command] === undefined) {
        res.send(404, "Unknown command: " + req.params.command);
        return;
    }

    if (!connected) {
        res.send(500, "Not connected");
        return;
    }

    sendCommands(commands[req.params.command]);
    res.send(200);
};

function sendCommands(commands) {
    // Just send everything fire & forget.
    for (var i = 0; i < commands.length; i++) {
        eiscp.command(commands[i]);
    }
}
