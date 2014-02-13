// Module for handling setup of the various types of device that widgets control.
define(['./power', './xbmc'], function (mcs, xbmc) {
    // The available device types.
    var deviceTypes = {
        mcs: mcs,
        xbmc: xbmc
    };

    // Module is a function that initialise all the given devices.
    return function (devices, parentNode) {
        for (var deviceName in devices) {
            var deviceParams = devices[deviceName];
            if (deviceParams.type && deviceTypes[deviceParams.type]) {
                // Find all widget for this device.
                var widgets = parentNode.find('[data-ha-device=' + deviceName + ']');

                // Initialise the device.
                deviceTypes[deviceParams.type].init(deviceName, deviceParams, widgets);
            }
        }
    };
});
