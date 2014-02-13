// The main view that shows the user's widgets.
define(['lib/page', './renderwidgets', 'widgets/devices'], function (page, renderwidgets, devices) {

    // Module object is the initalisation function.
    return function (pageContent) {
        // Load list of widgets.
        $.ajax({
            //url: 'user/widgets',
            // TEMP!
            url: 'test/controllist.json',
            cache: false
        })
        .success(function (data) {
            // Set logged in state (shows logout and customise buttons).
            page.setLoggedIn(true);

            pageContent.html(renderwidgets(data));
            devices(data.devices, pageContent);
        })
        .fail(function (jqxhr, textError, errorThrown) {
            if (jqxhr.status === 403) {
                // Redirect to the login page.
                page('login');
            } else {
                pageContent.html('ERROR getting widget list: ' + textError);
            }
        });
    }
});
