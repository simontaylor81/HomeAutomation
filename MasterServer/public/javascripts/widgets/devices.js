// Module for handling setup of the various types of device that widgets control.
define(['./power', './xbmc'], function (mcs, xbmc) {
    // The available device types.
    var deviceTypes = {
        mcs: mcs,
        xbmc: xbmc
    };

    // Module object.
    return {
        // Initialise all the given devices.
        init: function (devices, allWidgets) {
            for (var deviceName in devices) {
                var deviceParams = devices[deviceName];
                if (deviceParams.type && deviceTypes[deviceParams.type]) {
                    // Find all widget for this device.
                    var widgets = allWidgets.filter(function (w) { return w.device === deviceName; });

                    // Initialise the device.
                    deviceTypes[deviceParams.type].init(deviceName, deviceParams, widgets);
                }
            }
        },
        dispose: function () {
            // Allow all devices to clean up after themselves.
            for (var dt in deviceTypes) {
                deviceTypes[dt].dispose();
            };
        },
        getTypes: function () {
            return Object.keys(deviceTypes)
        },
        getCustomisableProperties: function (type) {
            return deviceTypes[type].getCustomisableProperties();
        }
    };
});
