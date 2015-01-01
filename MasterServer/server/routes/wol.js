var wol = require('wake_on_lan');

// Wake-on-lan handler.
exports.post = function (req, res) {
    console.log('wol: ' + req.params.mac);
    try {
        wol.wake(req.params.mac, {}, function(err) {
            if (err) {
                console.log('WOL failed: ' + err.message);
                res.send(500, err.message);
            } else {
                res.send(200);
            }
        });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
};
